import { Button } from '@/components/ui/button'
import { useUser } from '@/hooks/useUser'
import { useUpdateUserMutation } from '@/store/entities'
import type { User } from '@/types/user'
import { compressImage } from '@/utils/storage'
import { Award, Camera, LogOut, Mail, Trophy } from 'lucide-react'
import { memo, useCallback, useRef, useState } from 'react'
import { toast } from 'sonner'

interface ProfileHeaderProps {
	user: User
	onLogout: () => void
}

export const ProfileHeader = memo(function ProfileHeader({
	user,
	onLogout,
}: ProfileHeaderProps) {
	const { setUser } = useUser()
	const [updateUser, { isLoading: isUpdatingAvatar }] = useUpdateUserMutation()
	const [isUploading, setIsUploading] = useState(false)
	const fileInputRef = useRef<HTMLInputElement>(null)

	const unlockedAchievements = user.achievements.filter(
		a => a.unlockedAt !== undefined
	).length

	const handleAvatarClick = useCallback(() => {
		fileInputRef.current?.click()
	}, [])

	const handleAvatarChange = useCallback(
		async (e: React.ChangeEvent<HTMLInputElement>) => {
			const file = e.target.files?.[0]
			if (!file) return

			// Проверяем тип файла
			if (!file.type.startsWith('image/')) {
				toast.error('Пожалуйста, выберите изображение')
				return
			}

			// Проверяем размер файла (макс. 5 МБ)
			const maxSizeMB = 5
			const fileSizeMB = file.size / (1024 * 1024)
			if (fileSizeMB > maxSizeMB) {
				toast.error(`Размер файла превышает ${maxSizeMB} МБ`)
				return
			}

			setIsUploading(true)

			try {
				// Сжимаем изображение
				const compressedAvatar = await compressImage(file, 400, 400, 0.9)

				// Обновляем аватар через API
				const result = await updateUser({
					userId: user.id,
					data: { avatar: compressedAvatar },
				}).unwrap()

				// Обновляем пользователя в контексте
				setUser(prevUser => {
					if (!prevUser) return prevUser
					return {
						...prevUser,
						avatar: result.avatar || compressedAvatar,
					}
				})

				toast.success('Аватар успешно обновлен!')
			} catch (error) {
				// Улучшенная обработка ошибок RTK Query
				let errorMessage = 'Не удалось обновить аватар. Попробуйте еще раз.'

				if (error && typeof error === 'object') {
					// RTK Query ошибка может быть в формате { status, data, error }
					if ('data' in error && error.data) {
						const errorData = error.data as
							| { message?: string }
							| { error?: string }
							| string
						if (typeof errorData === 'string') {
							errorMessage = errorData
						} else if (errorData && typeof errorData === 'object') {
							if (
								'message' in errorData &&
								typeof errorData.message === 'string'
							) {
								errorMessage = errorData.message
							} else if (
								'error' in errorData &&
								typeof errorData.error === 'string'
							) {
								errorMessage = errorData.error
							}
						}
					} else if ('error' in error && typeof error.error === 'string') {
						errorMessage = error.error
					} else if ('message' in error && typeof error.message === 'string') {
						errorMessage = error.message
					}
				} else if (error instanceof Error) {
					errorMessage = error.message
				}

				toast.error(errorMessage)
				if (import.meta.env.DEV) {
					console.error('Error updating avatar:', error)
					console.error('Error details:', JSON.stringify(error, null, 2))
				}
			} finally {
				setIsUploading(false)
				// Сбрасываем значение input, чтобы можно было выбрать тот же файл снова
				if (fileInputRef.current) {
					fileInputRef.current.value = ''
				}
			}
		},
		[updateUser, user.id, setUser]
	)

	return (
		<div className='relative overflow-hidden rounded-3xl shadow-2xl bg-linear-to-br from-blue-500 via-blue-400 to-cyan-400'>
			{/* Декоративные элементы */}
			<div className='absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2' />
			<div className='absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2' />
			{/* Затемняющий слой для лучшей читаемости */}
			<div className='absolute inset-0 bg-linear-to-b from-black/10 to-black/5' />

			<div className='relative p-6 sm:p-8 md:p-10 z-10'>
				{/* Верхняя часть с кнопкой выхода */}
				<div className='flex justify-end mb-6'>
					<Button
						variant='outline'
						onClick={onLogout}
						className='bg-white/90 backdrop-blur-sm border-white/50 text-slate-700 hover:bg-white shadow-lg'
						size='sm'
					>
						<LogOut className='h-4 w-4 mr-2' />
						Выйти
					</Button>
				</div>

				{/* Основная информация */}
				<div className='flex flex-col sm:flex-row items-start sm:items-center gap-6 mb-8'>
					{/* Аватар */}
					<div className='relative shrink-0 group'>
						<button
							type='button'
							onClick={handleAvatarClick}
							disabled={isUploading || isUpdatingAvatar}
							className='relative w-24 h-24 sm:w-32 sm:h-32 md:w-40 md:h-40 rounded-2xl bg-white/95 backdrop-blur-md border-4 border-white flex items-center justify-center text-blue-600 text-4xl sm:text-5xl md:text-6xl font-bold shadow-xl overflow-hidden transition-all hover:scale-105 hover:shadow-2xl disabled:opacity-50 disabled:cursor-not-allowed'
							title='Нажмите, чтобы изменить аватар'
						>
							{user.avatar ? (
								<img
									src={user.avatar}
									alt={user.name}
									className='w-full h-full object-cover'
								/>
							) : (
								<span>{user.name.charAt(0).toUpperCase()}</span>
							)}
							{/* Overlay при наведении */}
							<div className='absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center'>
								{isUploading || isUpdatingAvatar ? (
									<div className='h-6 w-6 sm:h-8 sm:w-8 border-2 border-white border-t-transparent rounded-full animate-spin' />
								) : (
									<Camera className='h-6 w-6 sm:h-8 sm:w-8 text-white' />
								)}
							</div>
						</button>
						<input
							ref={fileInputRef}
							type='file'
							accept='image/*'
							onChange={handleAvatarChange}
							className='hidden'
							disabled={isUploading || isUpdatingAvatar}
						/>
						{/* Бейдж уровня */}
						<div className='absolute -bottom-2 -right-2 bg-yellow-400 text-yellow-900 rounded-full px-3 py-1 text-xs sm:text-sm font-bold shadow-lg border-2 border-white z-10'>
							Lv.{user.level.level}
						</div>
					</div>

					{/* Информация о пользователе */}
					<div className='flex-1 min-w-0 text-white'>
						<h1 className='text-2xl sm:text-3xl md:text-4xl font-bold mb-2 drop-shadow-lg text-white'>
							{user.name}
						</h1>
						<div className='flex items-center gap-2 mb-3 text-white'>
							<Mail className='h-4 w-4 shrink-0' />
							<p className='text-sm sm:text-base truncate'>{user.email}</p>
						</div>
						<div className='inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/90 backdrop-blur-sm border border-white text-slate-700 shadow-md'>
							<Award className='h-4 w-4 text-blue-600' />
							<span className='text-sm sm:text-base font-semibold'>
								{user.level.title}
							</span>
						</div>
					</div>
				</div>

				{/* Быстрая статистика */}
				<div className='grid grid-cols-2 gap-3 sm:gap-4'>
					<div className='bg-white/95 backdrop-blur-md rounded-xl p-3 sm:p-4 border border-white shadow-lg'>
						<div className='flex items-center gap-2 mb-1'>
							<Trophy className='h-4 w-4 sm:h-5 sm:w-5 text-blue-600 shrink-0' />
							<span className='text-xs sm:text-sm text-slate-700 font-medium'>
								Квестов
							</span>
						</div>
						<p className='text-xl sm:text-2xl font-bold text-slate-900'>
							{user.stats.totalQuests}
						</p>
					</div>

					<div className='bg-white/95 backdrop-blur-md rounded-xl p-3 sm:p-4 border border-white shadow-lg'>
						<div className='flex items-center gap-2 mb-1'>
							<Award className='h-4 w-4 sm:h-5 sm:w-5 text-yellow-600 shrink-0' />
							<span className='text-xs sm:text-sm text-slate-700 font-medium'>
								Достижений
							</span>
						</div>
						<p className='text-xl sm:text-2xl font-bold text-slate-900'>
							{unlockedAchievements}
						</p>
					</div>
				</div>
			</div>
		</div>
	)
})
