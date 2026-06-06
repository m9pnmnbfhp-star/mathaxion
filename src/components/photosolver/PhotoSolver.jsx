import { useState, useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import { motion, AnimatePresence } from 'framer-motion'
import { Camera, Upload, X, Lock, Loader } from 'lucide-react'
import Button from '../ui/Button'
import AIResponse from '../ui/AIResponse'
import Card from '../ui/Card'
import { solvePhotoExercise } from '../../lib/anthropic'
import useStore from '../../store/useStore'
import toast from 'react-hot-toast'

export default function PhotoSolver() {
  const { isPro, setUpgradeModal, user, setAuthModal } = useStore()
  const [image, setImage] = useState(null)
  const [preview, setPreview] = useState(null)
  const [solution, setSolution] = useState(null)
  const [loading, setLoading] = useState(false)

  const onDrop = useCallback((acceptedFiles) => {
    const file = acceptedFiles[0]
    if (!file) return
    if (file.size > 10 * 1024 * 1024) {
      toast.error('Η εικόνα είναι πολύ μεγάλη (max 10MB)')
      return
    }
    setImage(file)
    setPreview(URL.createObjectURL(file))
    setSolution(null)
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/*': ['.jpeg', '.jpg', '.png', '.webp', '.gif'] },
    maxFiles: 1,
    disabled: !isPro,
  })

  const handleSolve = async () => {
    if (!image) return

    if (!user) { setAuthModal(true, 'signup'); return }
    if (!isPro) { setUpgradeModal(true); return }

    setLoading(true)
    setSolution(null)

    try {
      const base64 = await fileToBase64(image)
      const result = await solvePhotoExercise(base64, image.type)
      setSolution(result)
    } catch (err) {
      toast.error('Σφάλμα επεξεργασίας. Δοκίμασε πάλι.')
    } finally {
      setLoading(false)
    }
  }

  if (!isPro) {
    return (
      <div className="flex flex-col items-center justify-center py-10 space-y-5">
        <div className="w-20 h-20 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
          <Camera size={36} className="text-amber-400" />
        </div>
        <div className="text-center space-y-2">
          <h3 className="text-lg font-bold text-white">Photo Solver</h3>
          <p className="text-slate-400 text-sm max-w-xs">
            Φωτογράφησε μια άσκηση και το Axi AI τη λύνει βήμα-βήμα!
          </p>
          <div className="flex items-center gap-1 justify-center mt-1">
            <Lock size={14} className="text-amber-400" />
            <span className="text-amber-400 text-sm font-medium">Απαιτείται Pro</span>
          </div>
        </div>
        <Button variant="gold" onClick={() => setUpgradeModal(true)} icon={<Lock size={16} />}>
          Αναβάθμιση για Photo Solver
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <AnimatePresence mode="wait">
        {!image ? (
          <motion.div
            key="dropzone"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div
              {...getRootProps()}
              className={`border-2 border-dashed rounded-2xl p-10 text-center cursor-pointer transition-all ${
                isDragActive
                  ? 'border-violet-400 bg-violet-500/10'
                  : 'border-[#2a2a3a] hover:border-violet-500/40 hover:bg-violet-500/5'
              }`}
            >
              <input {...getInputProps()} />
              <Upload size={36} className="mx-auto text-slate-500 mb-3" />
              <p className="text-white font-medium">Σύρε φωτογραφία εδώ</p>
              <p className="text-slate-500 text-sm mt-1">ή κάνε κλικ για επιλογή</p>
              <p className="text-slate-600 text-xs mt-3">JPG, PNG, WEBP — max 10MB</p>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="preview"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="space-y-3"
          >
            <div className="relative rounded-2xl overflow-hidden bg-[#1c1c28] border border-[#2a2a3a]">
              <img src={preview} alt="Άσκηση" className="w-full max-h-80 object-contain" />
              <button
                onClick={() => { setImage(null); setPreview(null); setSolution(null) }}
                className="absolute top-2 right-2 p-1.5 bg-black/60 rounded-lg text-white hover:bg-black/80 transition-colors"
              >
                <X size={16} />
              </button>
            </div>

            <div className="flex gap-2">
              <Button
                className="flex-1"
                onClick={handleSolve}
                loading={loading}
                icon={!loading && <Camera size={16} />}
                size="lg"
              >
                {loading ? 'Επίλυση...' : 'Λύσε την άσκηση!'}
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Solution */}
      <AnimatePresence>
        {loading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="space-y-3"
          >
            <div className="flex items-center gap-3 p-3 bg-violet-500/10 border border-violet-500/20 rounded-xl">
              <Loader size={16} className="text-violet-400 animate-spin shrink-0" />
              <p className="text-sm text-violet-300">Το Axi AI διαβάζει την άσκηση...</p>
            </div>
            <div className="space-y-2">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="shimmer h-4 rounded" style={{ width: `${60 + Math.random() * 40}%` }} />
              ))}
            </div>
          </motion.div>
        )}

        {solution && !loading && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Card>
              <div className="flex items-center gap-2 mb-4 pb-3 border-b border-[#2a2a3a]">
                <Camera size={16} className="text-violet-400" />
                <span className="text-sm font-semibold text-white">Λύση βήμα-βήμα</span>
              </div>
              <AIResponse text={solution} />
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

async function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result.split(',')[1])
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}
