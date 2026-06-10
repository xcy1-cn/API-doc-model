let docs = null;
let allApis = [];
let currentApiId = null;
let collapsedGroups = {};

async function init() {
    try {
        const response = await fetch("./api-docs.json");
        docs = await response.json();

        document.getElementById("projectName").innerText = docs.projectName || "接口文档";
        document.getElementById("projectDesc").innerText = docs.description || "Local API Docs Viewer";

        collectApis();
        renderMenu(allApis);

        if (allApis.length > 0) {
            selectApi(allApis[0].id);
        } else {
            renderEmpty();
        }

        bindSearch();
    } catch (error) {
        console.error("加载接口文档失败:", error);
        document.getElementById("apiDetail").innerHTML = `
      <div class="empty">接口文档加载失败，请检查 api-docs.json</div>
    `;
    }
}

function collectApis() {
    allApis = [];

    docs.groups.forEach((group, groupIndex) => {
        group.apis.forEach((api, apiIndex) => {
            allApis.push({
                ...api,
                id: `${groupIndex}-${apiIndex}`,
                groupName: group.name
            });
        });
    });
}

function renderMenu(apiList) {
  const menu = document.getElementById("apiMenu");

  const groupMap = {};

  apiList.forEach(function (api) {
    if (!groupMap[api.groupName]) {
      groupMap[api.groupName] = [];
    }

    groupMap[api.groupName].push(api);
  });

  menu.innerHTML = Object.keys(groupMap).map(function (groupName) {
    const isCollapsed = collapsedGroups[groupName] === true;

    const items = groupMap[groupName].map(function (api) {
      const activeClass = api.id === currentApiId ? "active" : "";

      return `
        <div class="api-item ${activeClass}" onclick="selectApi('${api.id}')">
          <span class="api-name">${escapeHtml(api.title)}</span>
          <span class="method ${api.method}">${api.method}</span>
        </div>
      `;
    }).join("");

    return `
      <div class="group">
        <div class="group-title group-title-row" onclick="toggleGroup('${escapeForJs(groupName)}')">
          <span>${escapeHtml(groupName)}</span>
          <span class="collapse-icon">${isCollapsed ? "›" : "⌄"}</span>
        </div>
        <div class="group-apis ${isCollapsed ? "collapsed" : ""}">
          ${items}
        </div>
      </div>
    `;
  }).join("");
}

function toggleGroup(groupName) {
  collapsedGroups[groupName] = !collapsedGroups[groupName];
  renderMenu(getFilteredApis());
}


function selectApi(apiId) {
    const api = allApis.find(item => item.id === apiId);

    if (!api) return;

    currentApiId = apiId;
    renderMenu(getFilteredApis());
    renderDetail(api);
}

function renderDetail(api) {
  const detail = document.getElementById("apiDetail");

  const requestExample = formatJson(api.example);
  const responseExample = formatJson(api.response);
  const httpCode = generateHttpCode(api);
  const axiosCode = generateAxiosCode(api);

  detail.innerHTML = `
    <div class="breadcrumb">${escapeHtml(api.groupName)}</div>

    <div class="api-title">${escapeHtml(api.title)}</div>

    <div class="api-path">
      <span class="method ${api.method}">${api.method}</span>
      <span class="path-text">${escapeHtml(api.path)}</span>
      <button class="copy-btn" onclick="copyText('${escapeForJs(api.path)}')">复制路径</button>
    </div>

    <div class="api-desc">${escapeHtml(api.description || "")}</div>

    ${renderParamsSection("Path 参数", api.params)}
    ${renderParamsSection("Header 参数", api.headers)}
    ${renderParamsSection("Query 参数", api.query)}
    ${renderParamsSection("Body 参数", api.body)}

    ${renderCodeSection("请求示例", requestExample, "复制请求")}
    ${renderCodeSection("响应示例", responseExample, "复制响应")}
    ${renderCodeSection("HTTP 请求代码", httpCode, "复制 HTTP")}
    ${renderCodeSection("Axios 请求代码", axiosCode, "复制 Axios")}
  `;
}

function renderParamsSection(title, params) {
    if (!params || params.length === 0) return "";

    const rows = params.map(item => {
        return `
      <tr>
        <td class="param-name">${escapeHtml(item.name)}</td>
        <td>${escapeHtml(item.type || "-")}</td>
        <td class="${item.required ? "required" : "optional"}">
          ${item.required ? "必填" : "可选"}
        </td>
        <td>${escapeHtml(item.default || "-")}</td>
        <td>${escapeHtml(item.description || "-")}</td>
      </tr>
    `;
    }).join("");

    return `
    <div class="section">
      <div class="section-title">${title}</div>
      <table class="table">
        <thead>
          <tr>
            <th>参数名</th>
            <th>类型</th>
            <th>是否必填</th>
            <th>默认值</th>
            <th>说明</th>
          </tr>
        </thead>
        <tbody>${rows}</tbody>
      </table>
    </div>
  `;
}

function renderCodeSection(title, code, buttonText) {
  return `
    <div class="section">
      <div class="section-title section-title-row">
        <span>${escapeHtml(title)}</span>
        <button class="copy-btn" onclick="copyText('${escapeForJs(code)}')">${buttonText}</button>
      </div>
      <pre class="code-block">${escapeHtml(code)}</pre>
    </div>
  `;
}

function generateHttpCode(api) {
  const method = String(api.method || "GET").toUpperCase();
  const path = api.path || "/";
  const headers = api.headers || [];
  const body = api.example || {};

  let code = `${method} ${path} HTTP/1.1\n`;
  code += `Host: localhost:3000\n`;

  headers.forEach(function (header) {
    if (header.name) {
      code += `${header.name}: ${header.default || ""}\n`;
    }
  });

  if (method !== "GET" && method !== "DELETE") {
    code += `Content-Type: application/json\n`;
    code += `\n`;
    code += JSON.stringify(body, null, 2);
  }

  return code;
}

function bindSearch() {
    const searchInput = document.getElementById("searchInput");

    searchInput.addEventListener("input", () => {
        renderMenu(getFilteredApis());
    });
}

function getFilteredApis() {
    const keyword = document.getElementById("searchInput") ?.value ?.trim().toLowerCase() || "";

    if (!keyword) return allApis;

    return allApis.filter(api => {
        return (
            api.title.toLowerCase().includes(keyword) ||
            api.path.toLowerCase().includes(keyword) ||
            api.method.toLowerCase().includes(keyword) ||
            api.groupName.toLowerCase().includes(keyword)
        );
    });
}

function generateAxiosCode(api) {
  const method = String(api.method || "GET").toLowerCase();
  const path = api.path || "/";
  const headers = api.headers || [];
  const body = api.example || {};

  const headerObj = {};

  headers.forEach(function (header) {
    if (header.name) {
      headerObj[header.name] = header.default || "";
    }
  });

  if (method === "get" || method === "delete") {
    return `axios.${method}("${path}", {
  headers: ${JSON.stringify(headerObj, null, 2)}
})`;
  }

  return `axios.${method}("${path}",
  ${JSON.stringify(body, null, 2)},
  {
    headers: ${JSON.stringify(headerObj, null, 2)}
  }
)`;
}

function copyText(text) {
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(text).then(function () {
      showToast("复制成功");
    }).catch(function () {
      fallbackCopyText(text);
    });
  } else {
    fallbackCopyText(text);
  }
}

function fallbackCopyText(text) {
  const textarea = document.createElement("textarea");
  textarea.value = text;
  textarea.style.position = "fixed";
  textarea.style.left = "-9999px";
  textarea.style.top = "-9999px";

  document.body.appendChild(textarea);
  textarea.focus();
  textarea.select();

  try {
    document.execCommand("copy");
    showToast("复制成功");
  } catch (error) {
    console.error("复制失败:", error);
    showToast("复制失败");
  }

  document.body.removeChild(textarea);
}

function showToast(message) {
  let toast = document.getElementById("toast");

  if (!toast) {
    toast = document.createElement("div");
    toast.id = "toast";
    toast.className = "toast";
    document.body.appendChild(toast);
  }

  toast.innerText = message;
  toast.classList.add("show");

  setTimeout(function () {
    toast.classList.remove("show");
  }, 1600);
}

function escapeForJs(value) {
  return String(value)
    .replace(/\\/g, "\\\\")
    .replace(/'/g, "\\'")
    .replace(/\n/g, "\\n")
    .replace(/\r/g, "\\r");
}

function renderEmpty() {
    document.getElementById("apiDetail").innerHTML = `
    <div class="empty">暂无接口数据</div>
  `;
}

function formatJson(data) {
    return JSON.stringify(data || {}, null, 2);
}

function escapeHtml(value) {
    return String(value)
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}

init();