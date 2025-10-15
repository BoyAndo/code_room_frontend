// Declaraciones de tipos para módulos CSS
declare module "*.css" {
  const content: { [className: string]: string };
  export default content;
}

// Declaraciones para importaciones de side-effect de CSS
declare module "*.css" {
  const content: void;
  export = content;
}
