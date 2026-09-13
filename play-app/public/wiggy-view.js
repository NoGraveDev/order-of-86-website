import * as T from 'three';
// Warp the rendered scene itself rather than relying on subtle CSS transforms.
export function createWiggyView(renderer){let started=-10000,target=null;const size=new T.Vector2(),screen=new T.Scene(),camera=new T.Camera();
 const material=new T.ShaderMaterial({uniforms:{picture:{value:null},elapsed:{value:0},strength:{value:0}},depthTest:false,depthWrite:false,vertexShader:'varying vec2 uvScene; void main(){uvScene=uv; gl_Position=vec4(position.xy,0.,1.);}',fragmentShader:`
 varying vec2 uvScene; uniform sampler2D picture; uniform float elapsed; uniform float strength;
 void main(){
  vec2 uv=(uvScene-.5)*(1.-.03*strength)+.5;
  uv.x+=sin(uv.y*19.+elapsed*4.5)*.012*strength;
  uv.y+=sin(uv.x*16.-elapsed*3.7)*.009*strength;
  vec2 split=vec2(.0018*strength,0.);
  vec3 color=vec3(texture2D(picture,uv+split).r,texture2D(picture,uv).g,texture2D(picture,uv-split).b);
  gl_FragColor=vec4(color,1.);
  #include <tonemapping_fragment>
  #include <colorspace_fragment>
 }`});screen.add(new T.Mesh(new T.PlaneGeometry(2,2),material));
 return {use(){started=performance.now();},get active(){return performance.now()-started<5000;},render(scene,view){const elapsed=(performance.now()-started)/1000;if(elapsed>=5){if(target){target.dispose();target=null;material.uniforms.picture.value=null;}renderer.render(scene,view);return;}
 renderer.getDrawingBufferSize(size);if(!target){target=new T.WebGLRenderTarget(size.x,size.y);material.uniforms.picture.value=target.texture;}else if(target.width!==size.x||target.height!==size.y)target.setSize(size.x,size.y);
 const fade=Math.min(1,elapsed/.35,(5-elapsed)/.6);material.uniforms.elapsed.value=elapsed;material.uniforms.strength.value=Math.max(0,fade);const previous=renderer.getRenderTarget();renderer.setRenderTarget(target);renderer.render(scene,view);renderer.setRenderTarget(previous);renderer.render(screen,camera);
 }};
}
