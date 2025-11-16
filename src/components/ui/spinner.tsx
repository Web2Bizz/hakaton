export const Spinner = () => {
	return (
		<div className='absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[35px] w-[35px]  animate-spin-spinner'>
			<div className='absolute h-full w-[30%] bottom-[5%] left-0 rotate-60 origin-[50%_85%]'>
				<div className='absolute bottom-0 left-0 h-0 w-full pb-[100%] bg-[#4b8aff] dark:bg-[#a1c4fd] rounded-full animate-wobble-1 [animation-delay:calc(0.8s*-0.3)]' />
			</div>
			<div className='absolute h-full w-[30%] bottom-[5%] right-0 -rotate-60 origin-[50%_85%]'>
				<div className='absolute bottom-0 left-0 h-0 w-full pb-[100%] bg-[#4b8aff] dark:bg-[#a1c4fd] rounded-full animate-wobble-1 [animation-delay:calc(0.8s*-0.15)]' />
			</div>
			<div className='absolute h-full w-[30%] bottom-[-5%] left-0 translate-x-[116.666%]'>
				<div className='absolute top-0 left-0 h-0 w-full pb-[100%] bg-[#4b8aff] dark:bg-[#a1c4fd] rounded-full animate-wobble-2' />
			</div>
		</div>
	)
}
