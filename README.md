# toPage
将一个 `HTML` 页面分割成几个标准尺寸（如 `A4` 等）的页面

Split an `HTML` page into several standard-sized pages (e.g. `A4`, etc.).

---

**注意：该项目正处于测试阶段，不建议应用在生产环境**

**Note: This project is in beta and is not recommended for use in a production environment**

---

### 待办事项
- **解决以下已知问题**
- 集成 `html2canvas` `jsPDF` 

### Todo
- **Addresses the following known issues**
- Integration with the `html2canvas` `jsPDF`

---

### 示例 / Example

```
<script src="./toPDF.js"></script>
```

```
toPage.depthLimit = 2;  // Limit the number of nested levels, the default value is 1000
toPage.pageScale = 3;   // Set the page zoom factor

toPage.paperSize = {    // Add page size information, the default includes A4
    "A4": {
        height: 297,
        width: 210
    }
}

toPage.onProcessPage(innerHTML){    // This function is triggered when pagination of a page is complete
    var newPage = document.createElement("div");
    newPage.id = "__createdByToPDF__showPage__" // Elements with id that begin with "__createdByToPDF__" will not be placed in the sequence.
    newPage.style.height = 297*toPage.pageScale + "px";
    newPage.style.width = 210*toPage.pageScale + "px";
    newPage.style.border = "1px solid #888";

    newPage.innerHTML = innerHTML;
    document.body.appendChild(newPage);
}

var a4Page = toPage.toSize("body", "A4");   // param@1 is an HTML Element or CSS Selector
                                            // param@2 is the page size

```

使用 `a4Page[pageNumber].innerHTML` 获取 `pageNumber` 页的 `HTML` 代码

Use `a4Page[pageNumber].innerHTML` to get the `HTML` code for the `pageNumber` page

---

最后修改于 *2023年2月22日*

Last modified on *February 22, 2023*
