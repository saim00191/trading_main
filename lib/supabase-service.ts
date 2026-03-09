import { supabase } from './supabaseClient'


export type PaymentStatus = 'Pending' | 'Approved' | 'Rejected' | 'Draft'

export interface PaymentInsert {
  user_email: string
  name: string
  amount: number
  months: number
  payment_method: string
  sender_number: string
  receiver_number: string
  account_holder_name: string
  screenshot_url?: string | null
}

export interface PaymentRecord {
  id: string
  user_email: string
  name: string
  amount: number
  months: number
  payment_method: string
  sender_number: string
  receiver_number: string
  account_holder_name: string
  screenshot_url?: string | null
  status: PaymentStatus
  created_at: string
}

export interface UserRecord {
  username: string
}

/* ===============================
   Upload Payment Screenshot
================================ */

export const uploadPaymentScreenshot = async (
  file: File,
  email: string
): Promise<string> => {

  const fileExt = file.name.split('.').pop()
  const fileName = `${email}-${Date.now()}.${fileExt}`
  const filePath = `screenshots/${fileName}`

  const { error } = await supabase.storage
    .from('payment-screenshots')
    .upload(filePath, file)

  if (error) {
    console.error('Upload Error:', error.message)
    throw new Error(error.message)
  }

  const { data } = supabase.storage
    .from('payment-screenshots')
    .getPublicUrl(filePath)

  if (!data?.publicUrl) {
    throw new Error('Failed to get public URL')
  }

  return data.publicUrl
}


/* ===============================
   Fetch Username
================================ */

export const fetchUserName = async (email: string): Promise<string> => {

  const { data, error } = await supabase
    .from('users')
    .select('username')
    .eq('email', email)
    .single()

  if (error) {
    console.error('Fetch Username Error:', error.message)
    throw new Error(error.message)
  }

  return data?.username || 'Unknown User'
}


/* ===============================
   Submit Payment
================================ */

export const submitPayment = async (payment: {
  user_email: string
  name: string
  amount: number
  months: number
  payment_method: string
  sender_number: string
  receiver_number: string
  account_holder_name: string
  screenshot_url?: string
}) => {

  const { data, error } = await supabase
    .from('records_of_payment')   // ✅ NEW TABLE
    .insert({
      user_email: payment.user_email,
      name: payment.name,
      amount: payment.amount,
      months: payment.months,
      payment_method: payment.payment_method,
      sender_number: payment.sender_number,
      receiver_number: payment.receiver_number,
      account_holder_name: payment.account_holder_name,
      screenshot_url: payment.screenshot_url ?? null
    })
    .select()
    .single()

  if (error) {
    console.error('Payment Insert Error:', error.message)
    throw new Error(error.message)
  }

  return data
}

//GET PAYMENT DATA

export const getPayments = async (
  email: string
): Promise<PaymentRecord[]> => {

  const { data, error } = await supabase
    .from('records_of_payment')
    .select('*')
    .eq('user_email', email)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Fetch Payments Error:', error.message)
    throw new Error(error.message)
  }

  return data ?? []
}


//SUPPORT REQUESTS
export const submitSupportRequest = async ({
  user_email,
  subject,
  category,
  message,
  priority,
}: {
  user_email: string;
  subject: string;
  category: string;
  message: string;
  priority: string;
}) => {
  // 1️⃣ Fetch user name from users table
  const { data: userData, error: userError } = await supabase
    .from("users")
    .select("username")
    .eq("email", user_email)
    .single();

  if (userError) {
    throw new Error("Failed to fetch user name");
  }

  const user_name = userData?.username;

  // 2️⃣ Insert into support_requests
  const { error } = await supabase.from("support_requests").insert([
    {
      user_email,
      user_name,
      subject,
      category,
      message,
      priority,
    },
  ]);

  if (error) {
    throw new Error("Failed to submit support request");
  }

  return true;
};





