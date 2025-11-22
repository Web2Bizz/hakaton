/**
 * Компонент для отображения QR кода
 * Использует внешний сервис для генерации QR кода
 */

interface QRCodeDisplayProps {
	data: string
}

export function QRCodeDisplay({ data }: QRCodeDisplayProps) {
	const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(
		data
	)}`

	return (
		<div className='flex items-center justify-center'>
			<img src={qrUrl} alt='QR Code' className='w-48 h-48' />
		</div>
	)
}

