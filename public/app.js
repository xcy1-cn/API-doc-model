let docs = null;
let allApis = [];
let currentApiId = null;

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

    apiList.forEach(api => {
        if (!groupMap[api.groupName]) {
            groupMap[api.groupName] = [];
        }

        groupMap[api.groupName].push(api);
    });

    menu.innerHTML = Object.keys(groupMap).map(groupName => {
        const items = groupMap[groupName].map(api => {
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
        <div class="group-title">${escapeHtml(groupName)}</div>
        ${items}
      </div>
    `;
    }).join("");
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

    detail.innerHTML = `
    <div class="breadcrumb">${escapeHtml(api.groupName)}</div>

    <div class="api-title">${escapeHtml(api.title)}</div>

    <div class="api-path">
      <span class="method ${api.method}">${api.method}</span>
      <span class="path-text">${escapeHtml(api.path)}</span>
    </div>

    <div class="api-desc">${escapeHtml(api.description || "")}</div>

    ${renderParamsSection("Path 参数", api.params)}
    ${renderParamsSection("Header 参数", api.headers)}
    ${renderParamsSection("Query 参数", api.query)}
    ${renderParamsSection("Body 参数", api.body)}

    <div class="section">
      <div class="section-title">请求示例</div>
      <pre class="code-block">${escapeHtml(formatJson(api.example))}</pre>
    </div>

    <div class="section">
      <div class="section-title">响应示例</div>
      <pre class="code-block">${escapeHtml(formatJson(api.response))}</pre>
    </div>
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