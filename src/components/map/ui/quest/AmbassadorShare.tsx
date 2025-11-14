import { useState } from 'react'
import { Share2, Copy, Check, X } from 'lucide-react'
import type { Quest } from '../../types/quest-types'
import { Button } from '@/components/ui/button'
import { useUser } from '@/hooks/useUser'
import { useNotifications } from '@/contexts/NotificationContext'

interface AmbassadorShareProps {
	readonly quest: Quest
	readonly onClose: () => void
	readonly onShare: (platform: string) => void
}

const sharePlatforms = [
	{
		id: 'vk',
		name: 'ВКонтакте',
		icon: '🔵',
		color: 'bg-blue-500 hover:bg-blue-600',
		url: (text: string, url: string) =>
			`https://vk.com/share.php?url=${encodeURIComponent(url)}&title=${encodeURIComponent(text)}`,
	},
	{
		id: 'telegram',
		name: 'Telegram',
		icon: '💬',
		color: 'bg-cyan-500 hover:bg-cyan-600',
		url: (text: string, url: string) =>
			`https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`,
	},
	{
		id: 'whatsapp',
		name: 'WhatsApp',
		icon: '💚',
		color: 'bg-green-500 hover:bg-green-600',
		url: (text: string, url: string) =>
			`https://wa.me/?text=${encodeURIComponent(`${text} ${url}`)}`,
	},
]

export function AmbassadorShare({ quest, onClose, onShare }: AmbassadorShareProps) {
	const { user } = useUser()
	const { addNotification } = useNotifications()
	const [copied, setCopied] = useState(false)

	const shareUrl = `${window.location.origin}/map?quest=${quest.id}`
	const shareText = `Присоединяйтесь к квесту "${quest.title}"! ${quest.story.substring(0, 100)}...`

	const handleShare = (platform: typeof sharePlatforms[0]) => {
		const url = platform.url(shareText, shareUrl)
		window.open(url, '_blank', 'width=600,height=400')
		onShare(platform.id)
		addNotification({
			type: 'quest_update',
			title: 'Спасибо за распространение!',
			message: `Вы поделились квестом "${quest.title}" в ${platform.name}`,
			questId: quest.id,
			icon: '📢',
		})
	}

	const handleCopyLink = async () => {
		try {
			await navigator.clipboard.writeText(shareUrl)
			setCopied(true)
			setTimeout(() => setCopied(false), 2000)
			addNotification({
				type: 'quest_update',
				title: 'Ссылка скопирована!',
				message: 'Теперь вы можете поделиться квестом',
				questId: quest.id,
				icon: '📋',
			})
		} catch (err) {
			console.error('Failed to copy:', err)
		}
	}

	return (
		<div className='fixed inset-0 z-[2000] flex items-center justify-center bg-black/50 backdrop-blur-sm'>
			<div className='relative w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl'>
				<button
					type='button'
					onClick={onClose}
					className='absolute right-4 top-4 rounded-full p-2 hover:bg-slate-100 transition-colors'
				>
					<X className='h-4 w-4 text-slate-600' />
				</button>

				<div className='mb-6'>
					<div className='flex items-center gap-2 mb-2'>
						<Share2 className='h-5 w-5 text-purple-500' />
						<h3 className='text-xl font-bold text-slate-900'>
							Поделиться квестом
						</h3>
					</div>
					<p className='text-sm text-slate-600 mb-1'>{quest.title}</p>
					<p className='text-xs text-slate-500 mb-4'>
						Помогите квесту найти больше участников!
					</p>
				</div>

				{/* Платформы для шаринга */}
				<div className='space-y-3 mb-6'>
					{sharePlatforms.map(platform => (
						<button
							key={platform.id}
							type='button'
							onClick={() => handleShare(platform)}
							className={`w-full p-4 rounded-xl ${platform.color} text-white flex items-center gap-3 transition-all hover:scale-[1.02]`}
						>
							<span className='text-2xl'>{platform.icon}</span>
							<span className='font-semibold'>{platform.name}</span>
						</button>
					))}
				</div>

				{/* Копирование ссылки */}
				<div className='mb-6'>
					<label className='block text-sm font-medium text-slate-700 mb-2'>
						Или скопируйте ссылку:
					</label>
					<div className='flex gap-2'>
						<input
							type='text'
							value={shareUrl}
							readOnly
							className='flex-1 px-3 py-2 border border-slate-300 rounded-lg text-sm'
						/>
						<Button
							type='button'
							onClick={handleCopyLink}
							variant={copied ? 'default' : 'outline'}
							className={copied ? 'bg-green-500 text-white' : ''}
						>
							{copied ? (
								<>
									<Check className='h-4 w-4 mr-1' />
									Скопировано
								</>
							) : (
								<>
									<Copy className='h-4 w-4 mr-1' />
									Копировать
								</>
							)}
						</Button>
					</div>
				</div>

				{/* Мотивация */}
				<div className='p-4 rounded-xl bg-purple-50 border border-purple-200'>
					<p className='text-sm text-slate-700 mb-2'>
						<strong>💡 Совет:</strong> Чем больше людей узнают о квесте, тем быстрее
						он будет завершен!
					</p>
					<p className='text-xs text-slate-600'>
						За каждую публикацию вы получаете опыт и помогаете квесту найти новых
						участников.
					</p>
				</div>
			</div>
		</div>
	)
}

