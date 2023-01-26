namespace toPage{
    type HTMLSelector = string | HTMLElement;

    interface size {
        height: number;
        width: number;
    }

    interface paperSize{
        [index: string]: size;
    }

    export var paperSize: paperSize = {
        "A4": {
            height: 297,
            width: 210
        }
    }

    export var depthLimit = 1000;

    export var pageScale: number = 4;

    /**页面 */
    export var paper: any[] = [];

    export var page = 0;
    /**分页信息 */
    export var splitPageInfo: HTMLElement[][][] = [];

    export var splitPageDistEleList: HTMLElement[] = [];

    export var debugMode: boolean = false;

    namespace toPageConsole{
        export function log(...args: any[]){
            if(toPage.debugMode) console.log(...args);
        }

        export function error(...args: any[]){
            if(toPage.debugMode) console.error(...args);
        }
    }

    /**
     * 将指定元素分割成指定大小的页面
     * @param {HTMLSelector} ele 元素
     * @param {keyof(paperSize)} size 尺寸型号 (A4)
     * @returns 
     */
    export function toSize(ele: HTMLSelector, size: keyof(paperSize)){
        if(!ele) return;

        /**临时发布元素 */
        var dist = document.getElementById("__createdByToPDF__distElement__");
        if(!dist){
            dist = document.createElement("div");
            dist.style.height = paperSize[size].height * pageScale + "px";
            dist.style.width = paperSize[size].width * pageScale + "px";
            dist.style.border = "1px solid #888";
            dist.style.overflow = "auto";
            dist.id = "__createdByToPDF__distElement__";
            document.body.appendChild(dist);
        }else{
            dist.innerHTML = "";
        }

        var parNode = (typeof(ele) === "string" ? document.querySelector(ele) : ele) as HTMLElement;

        if(!parNode) return;

        fillDistEle(parNode, dist as HTMLDivElement);
        dist.remove();
        return paper;
    }

    /**
     * 填充临时发布元素
     * @param parNode 父节点
     * @param dist 临时发布元素
     * @param fillEle 填充位置
     * @param index 起始引索
     * @returns 
     */
    function fillDistEle(parNode: HTMLElement, dist: HTMLDivElement, fillEle?: HTMLElement, index?: number, depth?: number){
        fillEle = fillEle || dist;

        depth = (!!depth || depth === 0) ? depth + 1 : 0;
        
        var nodes = parNode.childNodes;
        toPage.paper[toPage.page] = toPage.paper[toPage.page] || new Array();
        toPage.splitPageInfo
        var count = 0;

        splitPageDistEleList.push(fillEle);

        for(var i = index || 0; i < nodes.length; i++){
            /**当前元素 */
            var curEle = (nodes[i] as HTMLElement).cloneNode() as HTMLElement;
            curEle.innerHTML = (nodes[i] as HTMLElement).innerHTML;

            if((curEle.id || "").startsWith("__createdByToPDF__")) continue; //如果为创建的元素或不带元素标签的文本，跳过

            if(isThresholdEle(curEle, dist)){
                toPageConsole.log("遇到临界节点，尝试进入", curEle, curEle.childNodes.length);

                if(curEle.childNodes.length > 1 && depth < toPage.depthLimit){//两种情况 1. 父元素只含有两个元素且第一个不是#text 2. 父元素含有三个及以上元素
                    var curParNode = curEle.cloneNode() as HTMLDivElement;
                    curParNode.innerHTML = "";

                    if(!toPage.splitPageInfo[toPage.page + 1]) toPage.splitPageInfo[toPage.page + 1] = [];
                    toPage.splitPageInfo[toPage.page + 1].push([nodes[i] as HTMLElement, curParNode.cloneNode() as HTMLElement]);
                    
                    toPageConsole.log(depth, "临界节点含有子节点，进行裁剪", curParNode, toPage.splitPageInfo[toPage.page + 1])
                    
                    splitPageDistEleList[depth].appendChild(curParNode);
                    fillDistEle(curEle, dist, curParNode, undefined, depth);
                }else{ //换页
                    toPageConsole.log(depth, "临界节点不含有子节点, 空间不足，添加页面");

                    toPage.paper[toPage.page].innerHTML = dist.innerHTML;
                    onProcessPage(toPage.paper[toPage.page].innerHTML);

                    dist.innerHTML = "";
                    toPage.page++;
                    toPage.paper[toPage.page] = toPage.paper[toPage.page] || new Array();

                    /**重新构建页面结构 */
                    if(toPage.splitPageInfo[toPage.page]){
                        fillEle = dist;
                        toPage.splitPageInfo[toPage.page].forEach((item: any, index: number) => {
                            (fillEle as HTMLDivElement).appendChild(item[1]);

                            splitPageDistEleList[index] = item[1];
                            fillEle = item[1];
                        });
                    }

                    fillEle.appendChild(curEle);
                }
            }else{
                splitPageDistEleList[depth].appendChild(curEle);
                toPageConsole.log(depth, "已推入节点", curEle, splitPageDistEleList[depth]);
                count++;
            }
        }
    
        if(depth === 0) {
            toPage.paper[toPage.page].innerHTML = dist.innerHTML;
            dist.innerHTML = "";
            onProcessPage(toPage.paper[toPage.page].innerHTML);
        }
        splitPageDistEleList.pop();
        return count;
    }

    /**
     * 检查元素是否溢出
     * @param ele 元素
     * @returns {boolean}
     */
    export function isOverflow(ele: HTMLSelector): boolean{
        ele = (typeof(ele) === "string" ? document.querySelector(ele) : ele) as HTMLElement;
        return ele.scrollHeight > ele.clientHeight;
    }

    /**
     * 是否为临界元素，即添加此元素后则溢出页面
     * @param ele 元素
     * @param dist 临时发布元素
     * @param fillEle 填充位置
     * @returns 
     */
    export function isThresholdEle(ele: HTMLElement, dist: HTMLElement, fillEle?: HTMLElement): boolean{
        if(!fillEle) fillEle = dist;
        (fillEle as HTMLDivElement).appendChild(ele);
        var status = isOverflow(dist);
        ele.remove();
        return status;
    }

    export function onProcessPage(innerHTML: string){
        // var newPage = document.createElement("div");
        // newPage.id = "__createdByToPDF__showPage__"
        // newPage.style.height = 297 * pageScale + "px";
        // newPage.style.width = 210 * pageScale + "px";
        // newPage.style.border = "1px solid #888";
        
        // newPage.innerHTML = innerHTML
        // document.body.appendChild(newPage);
    }
}