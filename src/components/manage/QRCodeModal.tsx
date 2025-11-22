import { Button } from '@/components/ui/button'
import { QRCodeDisplay } from './QRCodeDisplay'

interface QRCodeModalProps {
	isOpen: boolean
	onClose: () => void
	qrCodeData: string
}

export function QRCodeModal({ isOpen, onClose, qrCodeData }: QRCodeModalProps) {
	if (!isOpen) return null

	return (
		<div className='fixed inset-0 bg-black/50 flex items-center justify-center z-50'>
			<div className='bg-white rounded-2xl p-6 max-w-md w-full mx-4'>
				<div className='flex items-center justify-between mb-4'>
					<h3 className='text-lg font-semibold text-slate-900'>
						QR код для отметки присутствия
					</h3>
					<button
						type='button'
						onClick={onClose}
						className='text-slate-500 hover:text-slate-900'
					>
						✕
					</button>
				</div>
				<div className='flex flex-col items-center space-y-4'>
					<div className='bg-white p-4 rounded-lg border-2 border-slate-200'>
						<QRCodeDisplay data={qrCodeData} />
					</div>
					<p className='text-sm text-slate-600 text-center'>
						Отсканируйте этот QR код, чтобы отметить присутствие волонтера
					</p>
					<Button type='button' variant='outline' onClick={onClose}>
						Закрыть
					</Button>
				</div>
			</div>
		</div>
	)
}

