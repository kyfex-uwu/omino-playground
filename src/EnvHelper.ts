export type EnhancedEnv = CanvasRenderingContext2D & {
    setFont:(font:string) => void,
    setFontSize:(size:number) => void
    spFillText:(text:string, x:number, y:number, data?:{
        align?:typeof CanvasRenderingContext2D.prototype.textAlign,
        baseline?:typeof CanvasRenderingContext2D.prototype.textBaseline
    })=>void,
    width:()=>number,
    height:()=>number,

    sRect:(x:number,y:number,w:number,h:number,r?:number)=> void,
}

let currFont="sans-serif";
let fontSize=12;
export default (bareEnv:CanvasRenderingContext2D, baseCanvas:HTMLCanvasElement):EnhancedEnv => {
    const updateFont = () => {
        bareEnv.font = `${fontSize}px ${currFont}`;
    }
    return Object.assign(bareEnv, {
        setFont(font:string){
            currFont=font;
            updateFont();
        },
        setFontSize(size:number){
            fontSize=size;
            updateFont();
        },
        spFillText(text:string, x:number, y:number, data:{align?:typeof bareEnv.textAlign, baseline?:typeof bareEnv.textBaseline}={}){
            bareEnv.textAlign=data.align ?? bareEnv.textAlign;
            bareEnv.textBaseline=data.baseline ?? bareEnv.textBaseline;
            bareEnv.fillText(text, x, y);
        },

        width(){
            return baseCanvas.width;
        },
        height(){
            return baseCanvas.height;
        },

        sRect(x:number,y:number,w:number,h:number,r?:number){
            bareEnv.beginPath();
            if(r === undefined){
                bareEnv.rect(x,y,w,h);
            }else{
                bareEnv.roundRect(x,y,w,h,r);
            }
            bareEnv.fill();
        },
    })
}
