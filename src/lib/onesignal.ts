import OneSignal from 'react-onesignal'
import { supabase } from './supabase'

let initialized = false

export async function initOneSignal() {
  if (initialized) return
  await OneSignal.init({
    appId: process.env.NEXT_PUBLIC_ONESIGNAL_APP_ID!,
    allowLocalhostAsSecureOrigin: true,
  })
  initialized = true
}

export async function initAndSaveOneSignalId(email: string) {
  try {
    await initOneSignal()
    await OneSignal.login(email)

    // Give OneSignal a moment to establish the subscription
    await new Promise(resolve => setTimeout(resolve, 1500))

    const subscriptionId = OneSignal.User.PushSubscription.id

    if (subscriptionId) {
      await supabase
        .from('stride_users')
        .update({ onesignal_id: subscriptionId })
        .eq('email', email)
    }
  } catch (err) {
    console.error('OneSignal init failed:', err)
  }
}