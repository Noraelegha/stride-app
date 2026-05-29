import OneSignal from 'react-onesignal'

export async function initOneSignal() {
  await OneSignal.init({
    appId: process.env.NEXT_PUBLIC_ONESIGNAL_APP_ID!,
    allowLocalhostAsSecureOrigin: true,
  })
}

export async function setOneSignalExternalId(email: string) {
  await OneSignal.login(email)
}