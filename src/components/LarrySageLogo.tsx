import React from "react";

export function LarrySageLogo({ className = "w-14 h-14" }: { className?: string }) {
  return (
    <div className={`relative rounded-full overflow-hidden bg-black border border-zinc-800 shadow-xl ${className}`} id="larry-sage-logo">
      <svg
        viewBox="0 0 512 512"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full object-cover select-none"
      >
        {/* Solid Pure Black Background */}
        <rect width="512" height="512" fill="#000000" />

        {/* HIGH-PRECISION RECREATION OF THE MONOCHROME LION LOGO */}
        <g id="lion-profile">
          {/* Main Back Mane Layers (Charcoal & Dark Grey Shapes) */}
          <path d="M462 180 C440 210, 410 230, 395 240 C380 250, 420 280, 460 300 C430 320, 390 310, 375 305 C360 300, 380 340, 400 380 C370 380, 340 350, 330 340 C320 330, 325 380, 330 430 C300 410, 280 370, 275 350 C270 330, 260 370, 250 420 C235 390, 225 350, 225 310" stroke="#1c1c1e" strokeWidth="8" strokeLinecap="round" strokeLinejoin="round" />
          
          {/* Main Dark Mane Spikes */}
          <path d="M370 120 C420 150, 450 200, 460 270 C410 265, 385 240, 370 220 L380 270 C330 260, 310 220, 298 190" fill="#18181b" />
          <path d="M410 280 C435 320, 440 370, 415 420 C380 380, 365 340, 360 300 L355 350 C310 330, 290 280, 285 240" fill="#27272a" />
          <path d="M360 410 C320 440, 275 460, 220 440 C220 380, 235 340, 250 310 L220 340 C195 300, 190 250, 200 210" fill="#3f3f46" />

          {/* Searing White Mane Outlines and Highlight Layers (Right flowing side) */}
          <path d="M255 125 C240 100, 210 90, 180 95 C205 110, 220 130, 230 155 C190 140, 150 145, 120 170 C150 180, 175 185, 195 200 C155 205, 125 220, 105 245 C135 250, 160 255, 180 270 C140 280, 115 305, 100 340 C125 335, 150 335, 170 345 C130 365, 110 405, 110 450 C135 430, 155 410, 180 405 C165 435, 160 465, 170 495 C185 465, 205 435, 230 415 C220 445, 215 475, 225 505 C245 465, 270 435, 300 415 C305 375, 290 325, 270 285 C295 280, 320 290, 340 310 C345 270, 335 230, 310 190 C335 195, 355 210, 370 230 C365 180, 345 140, 310 110 C330 115, 345 130, 355 150 C340 100, 305 75, 255 75 Z" fill="#ffffff" />
          
          {/* Contrast Shadows Inside the White Mane */}
          <path d="M225 150 C210 130, 190 120, 170 125 C185 135, 195 150, 200 170 Z" fill="#71717a" />
          <path d="M185 195 C165 185, 140 185, 125 195 C145 200, 160 210, 170 225 Z" fill="#71717a" />
          <path d="M175 260 C150 250, 125 255, 110 270 C130 270, 145 280, 155 295 Z" fill="#71717a" />
          <path d="M165 335 C140 330, 120 335, 105 350 C125 350, 140 360, 148 375 Z" fill="#71717a" />

          {/* High-Contrast White Face Details (Facing Left) */}
          {/* Ear highlight and structure */}
          <path d="M275 140 C295 145, 315 160, 310 180 C305 200, 280 205, 260 190 C250 180, 255 155, 275 140" fill="#000000" />
          <path d="M280 148 C295 152, 303 162, 300 173 C298 183, 280 188, 268 180 C260 173, 265 158, 280 148" fill="#ffffff" />

          {/* Forehead & Eyebrow */}
          <path d="M235 180 C215 175, 185 185, 165 205 C185 210, 205 210, 220 200 Z" fill="#ffffff" stroke="#ffffff" strokeWidth="2" />
          <path d="M152 221 L185 210 L168 226 Z" fill="#000000" /> {/* Brow line cut-out */}

          {/* Searing white snout profile and strong cheekbones */}
          <path d="M165 205 C150 210, 125 235, 110 260 C100 275, 85 290, 75 300 C85 305, 110 310, 120 300 C135 285, 150 265, 168 255 C185 245, 215 240, 235 245 C220 230, 195 215, 165 205 Z" fill="#ffffff" />
          
          {/* Muzzle, Mouth line, and Strong Chin */}
          <path d="M75 300 L68 312 C65 318, 68 325, 75 328 L85 330 L102 318 L90 312 L75 300 Z" fill="#000000" /> {/* Dark nose/muzzle shape */}
          <path d="M72 312 C75 315, 82 318, 90 318 C98 318, 105 314, 110 308" stroke="#ffffff" strokeWidth="6" strokeLinecap="round" />
          <path d="M82 328 C78 335, 82 342, 90 345 C100 348, 112 345, 122 335 L125 320" stroke="#ffffff" strokeWidth="7" strokeLinecap="round" />

          {/* Fierce angled majestic lion eye */}
          <path d="M172 225 C178 223, 186 225, 188 230 C186 235, 178 238, 172 235 C168 233, 168 227, 172 225 Z" fill="#ffffff" />
          <path d="M175 227 L182 231 L178 232 Z" fill="#000000" /> {/* Iris */}

          {/* Under-chin mane flow spikes (Charcoal & White) */}
          <path d="M122 335 L95 385 C115 375, 135 365, 145 355 Z" fill="#a1a1aa" />
          <path d="M135 355 L115 425 C135 410, 155 390, 165 370 Z" fill="#e4e4e7" />
          <path d="M152 375 L135 460 C160 440, 180 415, 190 390 Z" fill="#ffffff" />
        </g>
      </svg>

      {/* Glossy overlay effect to make it look premium */}
      <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-white/10 pointer-events-none rounded-full" />
    </div>
  );
}
