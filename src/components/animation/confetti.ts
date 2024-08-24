interface ParamsType {
  target?: string | HTMLCanvasElement;
  max?: number;
  size?: number;
  animate?: boolean;
  respawn?: boolean;
  props?: Array< { type: string; weight: number; src?: string; size?: number }>;
  colors?: number[][];
  clock?: number;
  start_from_edge?: boolean;
  width?: number;
  height?: number;
  rotate?: boolean;
}

interface AppState extends Required<ParamsType> {
  interval: number | null;
}

interface Particle {
  prop: string;
  x: number;
  y: number;
  src?: string;
  radius: number;
  size?: number;
  rotate: boolean;
  line: number;
  angles: number[];
  color: number[];
  rotation: number;
  speed: number;
}

export default function ConfettiGenerator(params: ParamsType) {
  // Defaults
  const appstate: AppState = {
    target: 'confetti-holder',
    max: 80,
    size: 1,
    animate: true,
    respawn: true,
    props: [{ type: 'circle', weight: .4 }, { type: 'square', weight: .5 }, { type: 'triangle', weight: 1 }, { type: 'line', weight: 1 }],
    colors: [[165,104,246],[230,61,135],[0,199,228],[253,214,126]],
    clock: 25,
    interval: null,
    rotate: false,
    start_from_edge: false,
    width: window.innerWidth,
    height: window.innerHeight
  };

  // Setting parameters if received
  if (params) {
    Object.keys(params).forEach((key) => {
      const typedKey = key as keyof ParamsType;
      if (params[typedKey] !== undefined && params[typedKey] !== null) {
        (appstate[typedKey] as any) = params[typedKey];
      }
    });
  }

  // Early exit if the target is not the correct type, or is null
  if (
    typeof appstate.target != 'object' &&
    typeof appstate.target != 'string'
  ) {
    throw new TypeError('The target parameter should be a node or string');
  }

  if (
    (typeof appstate.target == 'object' && (appstate.target === null || !(appstate.target instanceof HTMLCanvasElement))) ||
    (typeof appstate.target == 'string' && (document.getElementById(appstate.target) === null || !(document.getElementById(appstate.target) instanceof HTMLCanvasElement)))
  ) {
    throw new ReferenceError('The target element does not exist or is not a canvas element');
  }

  // Properties
  const cv: HTMLCanvasElement = typeof appstate.target == 'object'
    ? appstate.target
    : document.getElementById(appstate.target) as HTMLCanvasElement;
  const ctx: CanvasRenderingContext2D = cv.getContext("2d")!;
  let particles: (Particle | undefined)[] = [];

  // Random helper (to minimize typing)
  function rand(limit: number, floor?: boolean): number {
    if (!limit) limit = 1;
    const rand = Math.random() * limit;
    return !floor ? rand : Math.floor(rand);
  }

  const totalWeight = appstate.props.reduce((weight, prop) => {
    return weight + ((typeof prop === 'object' && prop.weight) || 1);
  }, 0);

  function selectProp(): number {
    let rand = Math.random() * totalWeight;
    for (let i = 0; i < appstate.props.length; ++i) {
      const weight = typeof appstate.props[i] === 'object' && appstate.props[i].weight ? appstate.props[i].weight : 1;
    
      
      if (rand < weight) return i;
      rand -= weight;
    }
    return 0;
  }

  // Confetti particle generator
  function particleFactory(): Particle {
    const prop = appstate.props[selectProp()];
    const p: Particle = {
      prop: typeof prop === 'object' ? prop.type : prop,
      x: rand(appstate.width),
      y: appstate.start_from_edge ? (appstate.clock >= 0 ? -10 : parseFloat(appstate.height.toString()) + 10) : rand(appstate.height),
      src: typeof prop === 'object' && prop.src ? prop.src : undefined,
      radius: rand(4) + 1,
      size: typeof prop === 'object' && prop.size ? prop.size : undefined,
      rotate: appstate.rotate,
      line: Math.floor(rand(65) - 30),
      angles: [rand(10, true) + 2, rand(10, true) + 2, rand(10, true) + 2, rand(10, true) + 2],
      color: appstate.colors[rand(appstate.colors.length, true)],
      rotation: rand(360, true) * Math.PI/180,
      speed: rand(appstate.clock / 7) + (appstate.clock / 30)
    };

    return p;
  }

  // Confetti drawing on canvas
  function particleDraw(p: Particle | undefined) {
    if (!p) {
      return;
    }

    const op = (p.radius <= 3) ? 0.4 : 0.8;

    ctx.fillStyle = ctx.strokeStyle = `rgba(${p.color}, ${op})`;
    ctx.beginPath();

    switch(p.prop) {
      case 'circle':{
        ctx.moveTo(p.x, p.y);
        ctx.arc(p.x, p.y, p.radius * appstate.size, 0, Math.PI * 2, true);
        ctx.fill();
        break;
      }
      case 'triangle': {
        ctx.moveTo(p.x, p.y);
        ctx.lineTo(p.x + (p.angles[0] * appstate.size), p.y + (p.angles[1] * appstate.size));
        ctx.lineTo(p.x + (p.angles[2] * appstate.size), p.y + (p.angles[3] * appstate.size));
        ctx.closePath();
        ctx.fill();
        break;
      }
      case 'line':{
        ctx.moveTo(p.x, p.y);
        ctx.lineTo(p.x + (p.line * appstate.size), p.y + (p.radius * 5));
        ctx.lineWidth = 2 * appstate.size;
        ctx.stroke();
        break;
      }
      case 'square': {
        ctx.save();
        ctx.translate(p.x+15, p.y+5);
        ctx.rotate(p.rotation);
        ctx.fillRect(-15 * appstate.size,-5 * appstate.size,15 * appstate.size,5 * appstate.size);
        ctx.restore();
        break;
      }
      case 'svg': {
        ctx.save();
        const image = new window.Image();
        image.src = p.src!;
        const size = p.size || 15;
        ctx.translate(p.x + size / 2, p.y + size / 2);
        if(p.rotate)
          ctx.rotate(p.rotation);
        ctx.drawImage(image, -(size/2) * appstate.size, -(size/2) * appstate.size, size * appstate.size, size * appstate.size);
        ctx.restore();
        break;
      }
    }
  }

  // Clean actual state
  const _clear = function() {
    appstate.animate = false;
    clearInterval(appstate.interval as number);

    requestAnimationFrame(function() {
      ctx.clearRect(0, 0, cv.width, cv.height);
      const w = cv.width;
      cv.width = 1;
      cv.width = w;
    });
  }

  // Render confetti on canvas
  const _render = function() {
    cv.width = appstate.width;
    cv.height = appstate.height;
    particles = [];

    for(let i = 0; i < appstate.max; i++)
      particles.push(particleFactory());

    function draw(){
      ctx.clearRect(0, 0, appstate.width, appstate.height);

      for(const p of particles)
        particleDraw(p);

      update();

      if(appstate.animate) requestAnimationFrame(draw);
    }

    function update() {
      for (let i = 0; i < appstate.max; i++) {
        const p = particles[i];

        if (p) {
          if(appstate.animate)
            p.y += p.speed;

          if (p.rotate)
            p.rotation += p.speed / 35;

          if ((p.speed >= 0 && p.y > appstate.height) || (p.speed < 0 && p.y < 0)) {
            if(appstate.respawn) {
              particles[i] = particleFactory();
              particles[i]!.x = rand(appstate.width, true);
              particles[i]!.y = p.speed >= 0 ? -10 : parseFloat(appstate.height.toString());
            } else {
              particles[i] = undefined;
            }
          }
        }
      }

      if (particles.every(p => p === undefined)) {
        _clear();
      }
    }

    return requestAnimationFrame(draw);
  };

  return {
    render: _render,
    clear: _clear
  }
}