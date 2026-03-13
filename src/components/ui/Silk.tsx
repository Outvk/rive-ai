"use client";

/* eslint-disable react/no-unknown-property */
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { forwardRef, useRef, useMemo, useLayoutEffect } from 'react';
import { Color } from 'three';

const hexToNormalizedRGB = (hex: string) => {
    hex = hex.replace('#', '');
    return [
        parseInt(hex.slice(0, 2), 16) / 255,
        parseInt(hex.slice(2, 4), 16) / 255,
        parseInt(hex.slice(4, 6), 16) / 255
    ];
};

const vertexShader = `
varying vec2 vUv;
varying vec3 vPosition;

void main() {
  vPosition = position;
  vUv = uv;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`;

const fragmentShader = `
varying vec2 vUv;
varying vec3 vPosition;

uniform float uTime;
uniform vec3  uColor1;
uniform vec3  uColor2;
uniform vec3  uColor3;
uniform float uSpeed;
uniform float uScale;
uniform float uRotation;
uniform float uNoiseIntensity;

const float e = 2.71828182845904523536;

float noise(vec2 texCoord) {
  float G = e;
  vec2  r = (G * sin(G * texCoord));
  return fract(r.x * r.y * (1.0 + texCoord.x));
}

vec2 rotateUvs(vec2 uv, float angle) {
  float c = cos(angle);
  float s = sin(angle);
  mat2  rot = mat2(c, -s, s, c);
  return rot * uv;
}

void main() {
  float rnd        = noise(gl_FragCoord.xy);
  vec2  uv         = rotateUvs(vUv * uScale, uRotation);
  vec2  tex        = uv * uScale;
  float tOffset    = uSpeed * uTime;

  tex.y += 0.03 * sin(8.0 * tex.x - tOffset);

  float pattern = 0.5 + 0.5 * sin(5.0 * (tex.x + tex.y +
                                   cos(3.0 * tex.x + 5.0 * tex.y) +
                                   0.02 * tOffset) +
                           sin(20.0 * (tex.x + tex.y - 0.1 * tOffset)));

  // mix three colors based on the pattern
  vec3 baseGrad = mix(uColor1, uColor2, pattern);
  vec3 finalGrad = mix(baseGrad, uColor3, pow(pattern, 2.0));

  vec4 col = vec4(finalGrad, 1.0) - rnd / 15.0 * uNoiseIntensity;
  col.a = 1.0;
  gl_FragColor = col;
}
`;

interface SilkPlaneProps {
    uniforms: any;
}

const SilkPlane = forwardRef<any, SilkPlaneProps>(function SilkPlane({ uniforms }, ref) {
    const { viewport } = useThree();
    const meshRef = ref as React.MutableRefObject<any>;

    useLayoutEffect(() => {
        if (meshRef.current) {
            meshRef.current.scale.set(viewport.width, viewport.height, 1);
        }
    }, [meshRef, viewport]);

    useFrame((_, delta) => {
        if (meshRef.current) {
            meshRef.current.material.uniforms.uTime.value += 0.1 * delta;
        }
    });

    return (
        <mesh ref={meshRef}>
            <planeGeometry args={[1, 1, 1, 1]} />
            <shaderMaterial uniforms={uniforms} vertexShader={vertexShader} fragmentShader={fragmentShader} />
        </mesh>
    );
});
SilkPlane.displayName = 'SilkPlane';

interface SilkProps {
    speed?: number;
    scale?: number;
    color1?: string;
    color2?: string;
    color3?: string;
    noiseIntensity?: number;
    rotation?: number;
}

const Silk = ({
    speed = 5,
    scale = 1,
    color1 = '#7405FF',
    color2 = '#15002F',
    color3 = '#b074ffff',
    noiseIntensity = 1.5,
    rotation = 0
}: SilkProps) => {
    const meshRef = useRef<any>(null);

    const uniforms = useMemo(
        () => ({
            uSpeed: { value: speed },
            uScale: { value: scale },
            uNoiseIntensity: { value: noiseIntensity },
            uColor1: { value: new Color(...hexToNormalizedRGB(color1)) },
            uColor2: { value: new Color(...hexToNormalizedRGB(color2)) },
            uColor3: { value: new Color(...hexToNormalizedRGB(color3)) },
            uRotation: { value: rotation },
            uTime: { value: 0 }
        }),
        [speed, scale, noiseIntensity, color1, color2, color3, rotation]
    );

    return (
        <div className="w-full h-full">
            <Canvas dpr={[1, 2]} frameloop="always">
                <SilkPlane ref={meshRef} uniforms={uniforms} />
            </Canvas>
        </div>
    );
};

export default Silk;
