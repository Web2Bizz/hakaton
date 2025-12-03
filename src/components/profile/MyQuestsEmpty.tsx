import { Button } from '@/components/ui/button'
import { ArrowRight, Target } from 'lucide-react'
import { Link } from 'react-router-dom'

export function MyQuestsEmpty() {
	return (
		<div className='bg-white rounded-2xl shadow-lg p-4 sm:p-6 md:p-8'>
			<div className='flex items-center justify-between mb-4 sm:mb-6'>
				<h2 className='text-xl sm:text-2xl font-bold text-slate-900 flex items-center gap-2'>
					<Target className='h-5 w-5 sm:h-6 sm:w-6 text-orange-600 shrink-0' />
					Мои квесты
				</h2>
			</div>
			<div className='text-center py-8 sm:py-12'>
				<div className='inline-flex items-center justify-center w-16 h-16 rounded-full bg-slate-100 mb-4'>
					<Target className='h-8 w-8 text-slate-400' />
				</div>
				<p className='text-sm sm:text-base text-slate-500 mb-4'>
					У вас пока нет созданных квестов
				</p>
				<Button
					asChild
					className='bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700'
				>
					<Link to='/add-organization'>
						Создать квест
						<ArrowRight className='h-4 w-4 ml-2' />
					</Link>
				</Button>
			</div>
		</div>
	)
}

