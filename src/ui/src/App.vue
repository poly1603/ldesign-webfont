<template>
  <div class="app-container">
    <header class="app-header">
      <h1>🔤 unplugin-webfont</h1>
      <p>通用字体转换工具</p>
    </header>

    <main class="app-main">
      <el-card class="upload-card">
        <template #header>
          <div class="card-header">
            <span>1. 上传字体文件</span>
          </div>
        </template>
        <el-upload
          ref="uploadRef"
          :auto-upload="false"
          :on-change="handleFileChange"
          :file-list="fileList"
          accept=".ttf,.otf,.woff,.woff2"
          drag
        >
          <el-icon class="el-icon--upload"><upload-filled /></el-icon>
          <div class="el-upload__text">
            拖拽字体文件到此处，或<em>点击上传</em>
          </div>
          <template #tip>
            <div class="el-upload__tip">
              支持 TTF、OTF、WOFF、WOFF2 格式
            </div>
          </template>
        </el-upload>
      </el-card>

      <el-card class="text-card">
        <template #header>
          <div class="card-header">
            <span>2. 输入要包含的文字（可选）</span>
          </div>
        </template>
        <el-input
          v-model="text"
          type="textarea"
          :rows="4"
          placeholder="输入要包含的文字，留空则保留所有字符"
        />
        <div class="text-stats" v-if="text">
          包含 {{ uniqueChars }} 个唯一字符
        </div>
      </el-card>

      <el-card class="config-card">
        <template #header>
          <div class="card-header">
            <span>3. 配置选项</span>
          </div>
        </template>
        <el-form :model="config" label-width="100px">
          <el-form-item label="输出格式">
            <el-checkbox-group v-model="config.formats">
              <el-checkbox label="woff2">WOFF2</el-checkbox>
              <el-checkbox label="woff">WOFF</el-checkbox>
              <el-checkbox label="ttf">TTF</el-checkbox>
            </el-checkbox-group>
          </el-form-item>
          <el-form-item label="字体名称">
            <el-input v-model="config.fontFamily" placeholder="自动检测" />
          </el-form-item>
          <el-form-item label="生成CSS">
            <el-switch v-model="config.generateCSS" />
          </el-form-item>
        </el-form>
      </el-card>

      <el-card class="preview-card" v-if="fontInfo">
        <template #header>
          <div class="card-header">
            <span>字体信息</span>
          </div>
        </template>
        <el-descriptions :column="2" border>
          <el-descriptions-item label="字体族">{{ fontInfo.family }}</el-descriptions-item>
          <el-descriptions-item label="样式">{{ fontInfo.style }}</el-descriptions-item>
          <el-descriptions-item label="粗细">{{ fontInfo.weight }}</el-descriptions-item>
          <el-descriptions-item label="格式">{{ fontInfo.format.toUpperCase() }}</el-descriptions-item>
          <el-descriptions-item label="字形数">{{ fontInfo.glyphCount }}</el-descriptions-item>
          <el-descriptions-item label="大小">{{ formatBytes(fontInfo.size) }}</el-descriptions-item>
        </el-descriptions>
      </el-card>

      <div class="action-buttons">
        <el-button type="primary" size="large" @click="handleConvert" :loading="converting" :disabled="!fileList.length">
          <el-icon><magic-stick /></el-icon>
          开始转换
        </el-button>
        <el-button size="large" @click="handleReset" :disabled="converting">
          <el-icon><refresh /></el-icon>
          重置
        </el-button>
      </div>

      <el-card class="result-card" v-if="results.length">
        <template #header>
          <div class="card-header">
            <span>转换结果</span>
            <el-button type="primary" size="small" @click="handleDownloadAll">
              下载全部
            </el-button>
          </div>
        </template>
        <el-table :data="results" stripe>
          <el-table-column prop="name" label="文件名" />
          <el-table-column prop="format" label="格式" width="100" />
          <el-table-column prop="size" label="大小" width="120">
            <template #default="{ row }">
              {{ formatBytes(row.size) }}
            </template>
          </el-table-column>
          <el-table-column label="操作" width="120">
            <template #default="{ row }">
              <el-button type="primary" link @click="handleDownload(row)">
                下载
              </el-button>
            </template>
          </el-table-column>
        </el-table>
      </el-card>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { ElMessage } from 'element-plus'
import { UploadFilled, MagicStick, Refresh } from '@element-plus/icons-vue'

interface FontInfo {
  family: string
  style: string
  weight: number
  format: string
  glyphCount: number
  size: number
}

interface ConvertResult {
  name: string
  format: string
  size: number
  blob: Blob
}

const fileList = ref<any[]>([])
const text = ref('')
const converting = ref(false)
const fontInfo = ref<FontInfo | null>(null)
const results = ref<ConvertResult[]>([])

const config = ref({
  formats: ['woff2', 'woff'],
  fontFamily: '',
  generateCSS: true
})

const uniqueChars = computed(() => {
  return new Set(text.value).size
})

function handleFileChange(file: any) {
  fileList.value = [file]
  // 这里需要实际实现字体信息读取
  fontInfo.value = {
    family: '示例字体',
    style: 'Regular',
    weight: 400,
    format: 'ttf',
    glyphCount: 1000,
    size: file.size
  }
}

async function handleConvert() {
  if (!fileList.value.length) {
    ElMessage.warning('请先上传字体文件')
    return
  }

  converting.value = true
  
  try {
    // 这里需要使用Web Worker处理字体转换
    // 暂时模拟结果
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    results.value = config.value.formats.map(format => ({
      name: `font.${format}`,
      format,
      size: Math.random() * 100000,
      blob: new Blob()
    }))
    
    if (config.value.generateCSS) {
      results.value.push({
        name: 'font.css',
        format: 'css',
        size: 500,
        blob: new Blob()
      })
    }
    
    ElMessage.success('转换完成!')
  } catch (error) {
    ElMessage.error('转换失败: ' + (error as Error).message)
  } finally {
    converting.value = false
  }
}

function handleReset() {
  fileList.value = []
  text.value = ''
  fontInfo.value = null
  results.value = []
}

function handleDownload(row: ConvertResult) {
  const url = URL.createObjectURL(row.blob)
  const a = document.createElement('a')
  a.href = url
  a.download = row.name
  a.click()
  URL.revokeObjectURL(url)
}

async function handleDownloadAll() {
  // 使用JSZip打包下载
  ElMessage.info('打包下载功能开发中...')
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return bytes + ' B'
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
}
</script>

<style scoped>
.app-container {
  min-height: 100vh;
  background: #f5f7fa;
}

.app-header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  text-align: center;
  padding: 2rem;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
}

.app-header h1 {
  margin: 0;
  font-size: 2.5rem;
}

.app-header p {
  margin: 0.5rem 0 0;
  opacity: 0.9;
}

.app-main {
  max-width: 1200px;
  margin: 2rem auto;
  padding: 0 1rem;
}

.el-card {
  margin-bottom: 1.5rem;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-weight: 600;
}

.text-stats {
  margin-top: 0.5rem;
  color: #909399;
  font-size: 14px;
}

.action-buttons {
  text-align: center;
  margin: 2rem 0;
}

.action-buttons .el-button {
  margin: 0 0.5rem;
}
</style>