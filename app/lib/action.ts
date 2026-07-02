'use server'

import { z } from 'zod'
import postgres from 'postgres'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { signIn } from '@/auth'
import { AuthError } from 'next-auth'

const sql = postgres(process.env.POSTGRES_URL!, { ssl: 'require'})
const FormSchema = z.object({
    id: z.string(),
    customerId: z.string({
        invalid_type_error: 'please select a customer'
    }),
    amount: z.coerce.number().gt(0, { message: 'please enter an amount greater than $0'}),
    status: z.enum(['pending', 'paid'], { invalid_type_error: 'please select an status'}),
    date: z.string()
})

export type State = {
    errors?: {
        customerId?: string[],
        amount?: string[],
        status?: string[]
    },
    message?: string | null;
}

const CreateInvoice = FormSchema.omit({id: true, date: true})
export async function createInvoice(preState: State, formData: FormData) {
  const validatedFields = CreateInvoice.safeParse({
    customerId: formData.get('customerId'),
    amount: formData.get('amount'),
    status: formData.get('status'),
  });
  if(!validatedFields.success) {
    return {
        errors: validatedFields.error.flatten().fieldErrors,
        message: 'Missing Fields. Failed to Create Invoice.'
    }
  }

  const { customerId, amount, status } = validatedFields.data
  const amountInCents = amount * 100
  const date = new Date().toISOString().split('T')[0]

  try {
    await sql`
        INSERT INTO invoices (customer_id, amount, status, date)
        VALUES (${customerId}, ${amountInCents}, ${status}, ${date})
    ` 
  } catch (error) {
    console.log('createInovice error:', error)
    return { message: 'Database Error: Failed to Create Invoice.' }
  }
    revalidatePath('/dashboard/invoices');
    redirect('/dashboard/invoices');   
}

const UpdateInvoice = FormSchema.omit({ id: true, date: true})
export async function updateInvoice(id: string, preState: State, formData: FormData) {
    const validatedFields = UpdateInvoice.safeParse({
        customerId: formData.get('customerId'),
        amount: formData.get('amount'),
        status: formData.get('status'),
    })
    if(!validatedFields.success) {
        return {
            errors: validatedFields.error.flatten().fieldErrors,
            message: 'Missing Fields. Failed to update Invoice.'
        }
    }
    const { customerId, amount, status } = validatedFields.data
    const amountInCents = amount * 100
    try {
        await sql`
            UPDATE invoices
            SET customer_id = ${customerId}, amount = ${amountInCents}, status = ${status}
            WHERE id = ${id}
        `        
    } catch (error) {
        console.log('updateInvoice error:', error)
        return { message: 'Database Error: Failed to Update Invoice.' }
    }

    revalidatePath('/dashboard/invoices');
    redirect('/dashboard/invoices');
}

const DeleteInvoice = FormSchema.pick({id: true})
export async function deleteInvoice(invoiceId: string) {
    const { id } = DeleteInvoice.parse({
        id: invoiceId
    })
    try {
        await sql`
            DELETE FROM invoices WHERE id = ${id}
        `        
    } catch (error) {
        console.log('deleteInvoice error:', error)
        // return { message: 'Database Error: Failed to delete Invoice.' }
    }

    revalidatePath('/dashboard/invoice')
}

export async function authenticate(preState: string | undefined, formData: FormData) {
    try {
        await signIn('credentials', formData)
    } catch (error) {
        if(error instanceof AuthError) {
            switch (error.type) {
                case 'CredentialsSignin':
                    return 'Invalid credentials. ';
                default:
                    return 'Something went wrong';
            }
        }
        throw error
    }
}