type extensions = {
    setFont:(font:string) => void
    setFontSize:(size:number) => void
    getFontSize:() => number
    spFillText:(text:string, x:number, y:number, data?:{
        align?:typeof CanvasRenderingContext2D.prototype.textAlign,
        baseline?:typeof CanvasRenderingContext2D.prototype.textBaseline
    })=>void,

    width:()=>number,
    height:()=>number,

    sRect:(x:number,y:number,w:number,h:number,r?:number)=> void,

    singleLine:(x1:number,y1:number,x2:number,y2:number)=>void,
    singleArc:(x: number,
               y: number,
               radius: number,
               startAngle: number,
               endAngle: number,
               counterclockwise?: boolean)=>void,
    polygon:(...points:[number,number][])=>void,

    tempGraphics:(w:number,h:number)=>TempEnhancedEnv,
}

export type EnhancedEnv = CanvasRenderingContext2D & extensions
export type TempEnhancedEnv = OffscreenCanvasRenderingContext2D & extensions
export type AnyEnhancedEnv = EnhancedEnv|TempEnhancedEnv

export default function EnvHelper(
    bareEnv:OffscreenCanvasRenderingContext2D,
    baseCanvas:OffscreenCanvas):TempEnhancedEnv
export default function EnvHelper(
    bareEnv:CanvasRenderingContext2D,
    baseCanvas:HTMLCanvasElement):EnhancedEnv
export default function EnvHelper(
    bareEnv:CanvasRenderingContext2D|OffscreenCanvasRenderingContext2D,
    baseCanvas:HTMLCanvasElement|OffscreenCanvas){

    let currFont="sans-serif";
    let fontSize=12;
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
        getFontSize(){ return fontSize; },

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

        //DOES FILL
        sRect(x:number,y:number,w:number,h:number,r?:number){
            bareEnv.beginPath();
            if(r === undefined){
                bareEnv.rect(x,y,w,h);
            }else{
                bareEnv.roundRect(x,y,w,h,r);
            }
            bareEnv.fill();
        },

        singleLine(x1:number,y1:number,x2:number,y2:number){
            bareEnv.beginPath();
            bareEnv.moveTo(x1,y1);
            bareEnv.lineTo(x2,y2);
            bareEnv.stroke();
        },
        singleArc(x: number,
                   y: number,
                   radius: number,
                   startAngle: number,
                   endAngle: number,
                   counterclockwise?: boolean){
            bareEnv.beginPath();
            bareEnv.arc(x, y, radius, startAngle, endAngle, counterclockwise);
        },
        polygon(...points:[number,number][]){
            bareEnv.beginPath();
            if(points[0]) bareEnv.moveTo(points[0][0],points[0][1]);
            for(const point of points.slice(1)) bareEnv.lineTo(point[0],point[1]);
        },

        tempGraphics(w:number,h:number){
            const newCanvas = new OffscreenCanvas(w,h);
            return EnvHelper(newCanvas.getContext("2d")!, newCanvas);
        }
    } satisfies extensions);
}
