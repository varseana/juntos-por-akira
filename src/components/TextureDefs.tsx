/**
 * Filtros SVG reutilizables para dar textura handmade (tiza / lapiz / papel).
 * Se montan una sola vez, ocultos, y se referencian por id desde CSS o SVG con
 * filter: url(#akira-rough) etc. feTurbulence + feDisplacementMap desplaza los
 * bordes para que se vean irregulares, como trazo hecho a mano.
 */
export function TextureDefs() {
  return (
    <svg
      width="0"
      height="0"
      aria-hidden="true"
      style={{ position: "absolute" }}
    >
      <defs>
        {/* Borde tembloroso tipo lapiz/marcador, para titulos grandes y marcos.
            x e y con frecuencias distintas para un trazo mas organico. */}
        <filter id="akira-rough">
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.018 0.026"
            numOctaves={3}
            seed={7}
            result="noise"
          />
          <feDisplacementMap
            in="SourceGraphic"
            in2="noise"
            scale={4}
            xChannelSelector="R"
            yChannelSelector="G"
          />
        </filter>

        {/* Textura de tiza: grano fino + leve difuminado como polvo de tiza. */}
        <filter id="akira-chalk">
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.9"
            numOctaves={2}
            seed={13}
            result="grain"
          />
          <feDisplacementMap
            in="SourceGraphic"
            in2="grain"
            scale={2.5}
          />
          <feGaussianBlur stdDeviation="0.4" />
        </filter>
      </defs>
    </svg>
  );
}
