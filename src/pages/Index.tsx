import { useEffect, useState } from 'react';

const STEPS = [
	'Reviewing your brief',
	'Reading intent',
	'Defining layout logic',
	'Structuring sections',
	'Applying design rules',
	'Optimizing responsiveness',
	'Preparing your canvas',
];

export default function Index() {
	const [currentStep, setCurrentStep] = useState(0);
	const [columns, setColumns] = useState<number[]>([]);

	useEffect(() => {
		const interval = setInterval(() => {
			setCurrentStep((prev) => (prev + 1) % STEPS.length);
		}, 3000);
		return () => clearInterval(interval);
	}, []);

	useEffect(() => {
		setColumns(
			Array(8)
				.fill(0)
				.map(() => Math.floor(Math.random() * 6)),
		);

		const interval = setInterval(() => {
			setColumns((prev) => prev.map((col) => (col + 1) % 8));
		}, 200);
		return () => clearInterval(interval);
	}, []);

	return (
		<div className="min-h-screen bg-[#FDFBF9] flex flex-col items-center justify-center overflow-hidden relative font-sans">
			<div className="grid grid-cols-8 gap-1 mb-6">
				{Array.from({ length: 48 }).map((_, i) => {
					const col = i % 8;
					const row = Math.floor(i / 8);
					const activeRow = columns[col];
					const distance = Math.abs(row - activeRow);
					const isActive = distance <= 2;
					const opacity = isActive ? 1 - distance * 0.3 : 0.1;

					return (
						<div
							key={i}
							className="w-1.5 h-1.5 transition-all duration-200"
							style={{
								backgroundColor: isActive && distance === 0 ? '#DFF803' : '#d4d4d4',
								opacity,
								transform: isActive && distance === 0 ? 'scale(1.3)' : 'scale(1)',
							}}
						/>
					);
				})}
			</div>
			<div className="text-[22px] text-[#282826] font-normal mb-1">Sticklight.</div>
			<p className="text-gray-500 text-sm font-semibold">{STEPS[currentStep]}</p>
		</div>
	);
}
