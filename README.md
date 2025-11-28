```
 _           _                    __  __           _      
| |         | |                  |  \/  |         (_)     
| |     ___ | | ___   _  __ _    | \  / |_   _ ___ _  ___ 
| |    / _ \| |/ / | | |/ _` |   | |\/| | | | / __| |/ __|
| |___| (_) |   <| |_| | (_| |   | |  | | |_| \__ \ | (__ 
|______\___/|_|\_\\__,_|\__,_|   |_|  |_|\__,_|___/_|\___|
```

# Lokua Music

## 简介

Lokua Music 基于 Node.js，聚合网易云、QQ、酷狗、酷我等音乐站点的歌曲搜索、元数据与播放链接，为开发者提供统一的 RESTful 接口与现代化前端体验。

## 特性

- 多站汇聚：一次集成即可访问 10+ 主流音频源。
- 标准返回：曲目信息、封面、歌词、外链结构统一。
- 前端即用：`/public/music.html` 内置苹果风播放器界面。
- 高可用：Express + CORS，方便直接在浏览器或服务器端调用。

## 快速开始

```bash
npm install
npm run dev    # 开发模式
npm run start  # 生产模式
```

启动后访问 `http://localhost:3000` 查看首页，点击“立刻体验”进入完整搜索界面。

## 环境变量

| 名称 | 说明 | 默认值 |
| --- | --- | --- |
| `PORT` | 服务监听端口 | `3000` |
| `MC_INTERNAL` | 是否模拟国内网络环境（`1` 为是） | `1` |
| `MC_PROXY` | HTTP 代理地址 `host:port` | 空 |
| `MC_PROXYUSERPWD` | 代理认证 `user:password` | 空 |

## API

### 统一入口：`POST /api/music`

请求体使用 `application/json`。

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `input` | string | 是 | 搜索关键词、歌曲 ID 或完整链接 |
| `filter` | string | 是 | `name`（按名称）、`id`（按 ID）、`url`（解析链接） |
| `type` | string | 否 | 目标平台代码，`filter=url` 时可忽略 |
| `page` | number | 否 | 页码，默认 1 |

平台代码速查：

| 代码 | 平台 | 代码 | 平台 |
| --- | --- | --- | --- |
| `netease` | 网易云音乐 | `qq` | QQ 音乐 |
| `kugou` | 酷狗音乐 | `kuwo` | 酷我音乐 |
| `baidu` | 千千音乐 | `1ting` | 一听音乐 |
| `migu` | 咪咕音乐 | `lizhi` | 荔枝 FM |
| `qingting` | 蜻蜓 FM | `ximalaya` | 喜马拉雅 |
| `kg` | 全民 K 歌 | `5singyc` | 5sing 原创 |

示例：

```json
{
  "input": "十年 陈奕迅",
  "filter": "name",
  "type": "netease",
  "page": 1
}
```

### 快捷入口

所有接口均返回与统一入口一致的 JSON 结构，支持查询参数 `input`、`filter=name|id`、`page`。

- `GET /api/netease`
- `GET /api/qq`
- `GET /api/kugou`
- `GET /api/kuwo`

示例：

```
GET /api/netease?input=十年&filter=name&page=1
```

## 技术栈

- Node.js + Express
- Tailwind CSS + Lucide Icons
- APlayer 播放器

## 许可证

MIT License

---

# Lokua Music (English)

## Overview

Lokua Music is a Node.js based aggregation service that unifies song search, metadata, lyrics, and playable URLs from major Chinese music platforms such as Netease Cloud Music, QQ Music, Kugou, and Kuwo.

## Features

- Multi-source gateway to 10+ popular providers with a single integration.
- Normalized JSON responses containing title, artist, cover, lyrics, links, and IDs.
- Built-in Apple-inspired web UI at `/public/music.html`.
- Express server with CORS enabled for both browser and server-side consumption.

## Quick Start

```bash
npm install
npm run dev    # development
npm run start  # production
```

Open `http://localhost:3000` after startup, then choose “Try Now” to reach the full search interface.

## Configuration

| Variable | Description | Default |
| --- | --- | --- |
| `PORT` | HTTP port | `3000` |
| `MC_INTERNAL` | Simulate mainland network (`1` = enabled) | `1` |
| `MC_PROXY` | HTTP proxy `host:port` | empty |
| `MC_PROXYUSERPWD` | Proxy auth `user:password` | empty |

## API Reference

### Unified Endpoint — `POST /api/music`

Body must be JSON.

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `input` | string | yes | Keyword, song ID, or full URL |
| `filter` | string | yes | `name`, `id`, or `url` |
| `type` | string | optional | Provider code, ignored when `filter=url` |
| `page` | number | optional | Page index, default 1 |

Provider codes:

| Code | Provider | Code | Provider |
| --- | --- | --- | --- |
| `netease` | Netease Cloud | `qq` | QQ Music |
| `kugou` | Kugou Music | `kuwo` | Kuwo Music |
| `baidu` | Qianqian | `1ting` | 1ting |
| `migu` | Migu Music | `lizhi` | Lizhi FM |
| `qingting` | Qingting FM | `ximalaya` | Ximalaya |
| `kg` | Quanmin K Song | `5singyc` | 5sing Original |

Example:

```json
{
  "input": "Ten Years",
  "filter": "name",
  "type": "netease",
  "page": 1
}
```

### Direct Provider Endpoints

Each endpoint accepts `input`, `filter=name|id`, and `page` as query parameters.

- `GET /api/netease`
- `GET /api/qq`
- `GET /api/kugou`
- `GET /api/kuwo`

Example:

```
GET /api/kugou?input=周杰伦&filter=name
```

## Tech Stack

- Node.js + Express
- Tailwind CSS + Lucide Icons
- APlayer

## License

MIT License
