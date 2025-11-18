export interface BeforeInstallPromptEvent extends Event {
	prompt(): Promise<void>
	userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

export interface SWMessageEvent extends MessageEvent {
	data: {
		type: 'SKIP_WAITING'
	}
}

export type InstallPrompt = BeforeInstallPromptEvent | null
