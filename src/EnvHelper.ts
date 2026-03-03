export type EnhancedEnv = CanvasRenderingContext2D & {
    setFont:(font:string) => void,
    setFontSize:(size:number) => void
    spFillText:(text:string, x:number, y:number, data?:{
        align?:typeof CanvasRenderingContext2D.prototype.textAlign,
        baseline?:typeof CanvasRenderingContext2D.prototype.textBaseline
    })=>void,
    beginClip:()=>void,
    endClip:()=>void,
    width:number,
    height:number,
}

let currFont="sans-serif";
let fontSize=12;
export default (bareEnv:CanvasRenderingContext2D, baseCanvas:HTMLCanvasElement):EnhancedEnv => {
    const updateFont = () => {
        bareEnv.font = `${fontSize}px ${currFont}`;
    }
    return Object.assign(bareEnv, {
        setFont:(font:string)=>{
            currFont=font;
            updateFont();
        },
        setFontSize:(size:number)=>{
            fontSize=size;
            updateFont();
        },
        spFillText:(text:string, x:number, y:number, data:{align?:typeof bareEnv.textAlign, baseline?:typeof bareEnv.textBaseline}={})=>{
            bareEnv.textAlign=data.align ?? bareEnv.textAlign;
            bareEnv.textBaseline=data.baseline ?? bareEnv.textBaseline;
            bareEnv.fillText(text, x, y);
        },

        beginClip:()=>{
            console.log("TODO")
        },
        endClip:()=>{
            console.log("TODO")
        },

        get width(){
            return baseCanvas.width;
        },
        get height(){
            return baseCanvas.height;
        }
    })
}
