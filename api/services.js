import complaintsHandler from './_lib/complaints-handler.js'
import driveUploadHandler from './_lib/drive-upload-handler.js'
import questionsHandler from './_lib/questions-handler.js'
import schoolDocumentsHandler from './_lib/school-documents-handler.js'
import { sendJson } from './_lib/http.js'

const handlers = {
  complaints: complaintsHandler,
  documents: schoolDocumentsHandler,
  questions: questionsHandler,
  uploads: driveUploadHandler,
}

export default function handler(request, response) {
  const resource = String(request.query?.resource || '').trim()
  const resourceHandler = handlers[resource]
  if (!resourceHandler) {
    return sendJson(response, 404, { error: 'ไม่พบส่วนบริการที่ต้องการ' })
  }
  return resourceHandler(request, response)
}
