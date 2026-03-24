"use client";

interface Props {
    cardholderName?: string;
}

function tilt(e: React.MouseEvent<HTMLDivElement>) {
    const el = e.currentTarget as HTMLDivElement;
    const rect = el.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const rx = ((y / rect.height) - 0.5) * -20;
    const ry = ((x / rect.width) - 0.5) * 20;
    el.style.setProperty('--rx', `${rx}deg`);
    el.style.setProperty('--ry', `${ry}deg`);
}

function resetTilt(e: React.MouseEvent<HTMLDivElement>) {
    const el = e.currentTarget as HTMLDivElement;
    el.style.setProperty('--rx', '0deg');
    el.style.setProperty('--ry', '0deg');
}

export function BillingCards3D({ cardholderName }: Props) {
    return (
        <div className="flex flex-col items-center justify-center py-4 gap-8">
            <div
                className="hover-3d relative"
                onMouseMove={tilt}
                onMouseLeave={resetTilt}
            >
                <figure className="rounded-2xl overflow-hidden w-80 h-48 flex flex-col justify-center items-center shadow-2xl relative">
                    <img
                        src="/dh.png"
                        alt="Carte Bancaire"
                        className="w-[100%] h-auto max-w-none transform -rotate-120"
                    />
                </figure>
                <div></div><div></div><div></div><div></div>
                <div></div><div></div><div></div><div></div>
            </div>

            <div
                className="hover-3d relative"
                onMouseMove={tilt}
                onMouseLeave={resetTilt}
            >
                <figure className="rounded-2xl overflow-hidden w-80 shadow-2xl">
                    <img
                        src="https://img.daisyui.com/images/stock/creditcard.webp"
                        alt="3D card"
                        className="w-full h-auto"
                    />
                </figure>
                <div></div><div></div><div></div><div></div>
                <div></div><div></div><div></div><div></div>
            </div>
        </div>
    );
}
