export function HomePageStyles() {
	return (
		<style>{`
			@keyframes fade-in {
				from {
					opacity: 0;
				}
				to {
					opacity: 1;
				}
			}

			@keyframes fade-in-up {
				from {
					opacity: 0;
					transform: translateY(20px);
				}
				to {
					opacity: 1;
					transform: translateY(0);
				}
			}

			.animate-fade-in {
				animation: fade-in 0.8s ease-out forwards;
			}

			.animate-fade-in-up {
				animation: fade-in-up 0.8s ease-out forwards;
			}

			.animation-delay-200 {
				animation-delay: 200ms;
			}

			.animation-delay-300 {
				animation-delay: 300ms;
			}

			.animation-delay-500 {
				animation-delay: 500ms;
			}

			.animation-delay-1000 {
				animation-delay: 1000ms;
			}
		`}</style>
	)
}

