'use client';

import { ShaderGradientCanvas, ShaderGradient } from '@shadergradient/react';

export default function GradientBackground() {
  return (
    <div className="absolute inset-0 pointer-events-none z-0 animate-out fade-out duration-600">  
      <ShaderGradientCanvas style={{ width: '100%', height: '100%' }}>
        <ShaderGradient
          control="query"
          urlString="https://www.shadergradient.co/customize?animate=on&axesHelper=off&bgColor1=%23000000&bgColor2=%23000000&brightness=1&cAzimuthAngle=180&cDistance=2.8&cPolarAngle=80&cameraZoom=9.1&color1=%23000047&color2=%2300009f&color3=%230000d1&destination=onCanvas&embedMode=off&envPreset=city&format=gif&fov=45&frameRate=10&gizmoHelper=hide&grain=off&lightType=3d&pixelDensity=0.7&positionX=0&positionY=0&positionZ=0&range=enabled&rangeEnd=40&rangeStart=0&reflection=0.1&rotationX=50&rotationY=0&rotationZ=-60&shader=defaults&type=waterPlane&uAmplitude=0&uDensity=1.2&uFrequency=0&uSpeed=0.2&uStrength=2.7&uTime=8&wireframe=false"
        />
      </ShaderGradientCanvas>
    </div>
  );
}
