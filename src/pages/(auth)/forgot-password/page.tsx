/**
 * @title Восстановление пароля
 * @description Восстановите доступ к вашему аккаунту, если вы забыли пароль. Введите email, и мы отправим вам инструкции по восстановлению
 * @keywords восстановление пароля, забыл пароль, сброс пароля, восстановить доступ, забыли пароль
 * @changefreq monthly
 * @priority 0.5
 */

import { ForgotPasswordForm } from '@/components/forms/forgot-password'

export default function ForgotPasswordPage() {
	return <ForgotPasswordForm />
}

