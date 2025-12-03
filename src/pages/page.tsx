/**
 * @title Главная страница
 * @description Карта добрых дел атомных городов - единая платформа для волонтеров, организаций и всех, кто хочет делать добрые дела
 * @keywords атом добро, карта добрых дел, волонтерство, атомные города, квесты, благотворительность, НКО, помощь, добрые дела
 * @changefreq daily
 * @priority 1.0
 */

import {
	AboutSection,
	CTASection,
	FeaturesSection,
	HeroSection,
	HowItWorksSection,
	StatsSection,
} from '@/components/home'
import { HomePageStyles } from '@/components/home/HomePageStyles'

export default function HomePage() {
	return (
		<main className='min-h-screen'>
			<HomePageStyles />
			<HeroSection />
			<AboutSection />
			<FeaturesSection />
			<HowItWorksSection />
			<StatsSection />
			<CTASection />
		</main>
	)
}
