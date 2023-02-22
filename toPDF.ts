namespace toPage{
    type HTMLSelector = string | HTMLElement;

    interface size {
        height: number;
        width: number;
    }

    interface paperSize{
        [index: string]: size;
    }

    export let paperSize: paperSize = {
        "A4": {
            height: 297,
            width: 210
        }
    }

    export let depthLimit = 1000;

    export let pageScale: number = 3;

    /**页面 */
    export let paper: any[] = [];

    export let page = 0;

    export let splitPageDistEleList: HTMLElement[] = [];

    export let debugMode: boolean = true;

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

        if(!paperSize[size]){
            console.warn(`cannot find page size "${size}"`);
            return;
        }

        /**临时发布元素 */
        let dist = getElementByCreateOrSearch("div", "__createdByToPDF__distElement__", (node: HTMLDivElement) => {
            node.style.height = paperSize[size].height * pageScale + "px";
            node.style.width = paperSize[size].width * pageScale + "px";
            node.style.border = "1px solid #888";
            node.style.overflow = "auto";
            node.id = "__createdByToPDF__distElement__";
        });

        let parNode = (typeof(ele) === "string" ? document.querySelector(ele) : ele) as HTMLElement;

        if(!parNode) return;

        let copy = document.createElement("div");
        copy.innerHTML = parNode.innerHTML;

        while(copy.innerText !== ""){
            if(fillDistEle(copy, dist as HTMLDivElement) === 0) break;
            if(copy.innerText === "") break;
        }

        dist.remove();
        copy.remove();
        return paper;
    }

    function getElementByCreateOrSearch(tagName: keyof(HTMLElementTagNameMap), id: string, onInit: Function){
        let node = document.getElementById(id);
        if(!node){
            node = document.createElement(tagName);
            onInit(node);
            document.body.appendChild(node);
        }else{
            node.innerHTML = "";
        }
        return node;
    }

    /**
     * 判断元素是否含有子元素
     * @param parent 父元素
     * @returns 
     */
    function hasChildNode(parent: HTMLElement): boolean{
        for(let i = 0; i < parent.childNodes.length; i++){
            if((parent.childNodes[i] as HTMLElement).tagName) return true;
        }
        return false;
    }

    /**
     * 判断元素是否为 `toPDF` 创建的
     * @param node 元素
     * @returns 
     */
    function isCreatedByToPDF(node: HTMLElement){
        return (node.id || "").startsWith("__createdByToPDF__");
    }

    /**
     * 填充临时发布元素
     * @param sourceNode 父节点
     * @param distNode 临时发布元素
     * @param fillNode 填充位置
     * @param index 起始引索
     * @returns 
     */
    function fillDistEle(sourceNode: HTMLElement, distNode: HTMLDivElement, fillNode?: HTMLElement, index?: number, depth?: number){
        fillNode = fillNode || distNode;
        depth = (!!depth || depth === 0) ? depth + 1 : 0;
        toPage.paper[toPage.page] = toPage.paper[toPage.page] || new Array();

        let nodes = sourceNode.childNodes;
        let count = 0;

        for(let i = 0; i < nodes.length; i++){
            /**当前元素 */
            let curEle = (nodes[i] as HTMLElement).cloneNode() as HTMLElement;
            curEle.innerHTML = (nodes[i] as HTMLElement).innerHTML;

            if(isCreatedByToPDF(curEle) || curEle.innerHTML === "") continue; //如果为创建的元素则跳过

            if(isThresholdNode(curEle, distNode)){ // 遇到临界节点
                toPageConsole.log(`搜索深度 ${depth}, 遇到临界节点，尝试进入`, curEle);
                
                if(hasChildNode(curEle) && depth < toPage.depthLimit){ // 含有子节点且不超过递归深度限制
                    let curParNode = curEle.cloneNode() as HTMLDivElement;
                    curParNode.innerHTML = "";
                    fillNode.appendChild(curParNode);
                    toPageConsole.log(`搜索深度: ${depth}, 临界节点含有子节点，进行裁剪`, curParNode)
                    fillDistEle(nodes[i] as HTMLElement, distNode, curParNode, undefined, depth);
                }else{ //换页
                    toPageConsole.log(`搜索深度 ${depth}, 临界节点不含有子节点, 空间不足，添加页面`);
                    break;
                }
            }else{
                (nodes[i] as HTMLElement).innerHTML = "";
                fillNode.appendChild(curEle);
                toPageConsole.log(`搜索深度 ${depth}, 已推入节点`, curEle, nodes[i]);
                count++;
            }
        }
    
        if(depth === 0 && distNode.innerHTML) {
            toPage.paper[toPage.page] = distNode.innerHTML;
            distNode.innerHTML = "";
            onProcessPage(toPage.paper[toPage.page]);
            toPage.page++;
        }

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
    export function isThresholdNode(ele: HTMLElement, dist: HTMLElement, fillEle?: HTMLElement): boolean{
        if(!fillEle) fillEle = dist;
        (fillEle as HTMLDivElement).appendChild(ele);
        let status = isOverflow(dist);
        ele.remove();
        return status;
    }

    export function onProcessPage(innerHTML: string){
        let newPage = document.createElement("div");
        newPage.id = "__createdByToPDF__showPage__"
        newPage.style.height = 297 * pageScale + "px";
        newPage.style.width = 210 * pageScale + "px";
        newPage.style.border = "1px solid #888";
        
        newPage.innerHTML = innerHTML
        document.body.appendChild(newPage);
    }
}
