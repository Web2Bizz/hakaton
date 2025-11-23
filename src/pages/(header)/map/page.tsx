/**
 * @title Карта организаций и квестов
 * @description Интерактивная карта волонтерских организаций и квестов в атомных городах. Найдите организации рядом с вами, участвуйте в квестах и делайте добрые дела
 * @keywords карта, организации, квесты, волонтерство, атомные города, интерактивная карта, найти организацию
 * @changefreq hourly
 * @priority 0.9
 */

import { MapComponent } from '@/components'

export const MapPage = () => {
	return (
		<div className='relative h-screen w-full z-10'>
			<MapComponent />
		</div>
	)
}
