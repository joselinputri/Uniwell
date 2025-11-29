import { useState, useRef } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import Navigation from "@/components/Navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Camera, Upload, X, ArrowLeft, Loader, CheckCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { expensesAPI } from "@/services/api";

type CategoryType = "Food" | "Academic" | "Lifestyle" | "Transport" | "Health" | "Entertainment" | "Others";

const UploadReceipt = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [ocrResult, setOcrResult] = useState<any>(null);
  const [uploadedOnce, setUploadedOnce] = useState(false);

  const [manualData, setManualData] = useState({
    merchant: "",
    amount: "",
    category: "Food" as CategoryType,
    date: new Date().toISOString().split("T")[0],
  });

  const categories: CategoryType[] = ["Food", "Academic", "Lifestyle", "Transport", "Health", "Entertainment", "Others"];

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/") && !file.type.includes("pdf")) { toast({ title: "Invalid file type", description: "Please select an image or PDF file", variant: "destructive" }); return; }
    if (file.size > 10 * 1024 * 1024) { toast({ title: "File too large", description: "Please select a file under 10MB", variant: "destructive" }); return; }
    setSelectedFile(file);
    if (file.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onloadend = () => setPreviewUrl(reader.result as string);
      reader.readAsDataURL(file);
    } else setPreviewUrl("");
    setUploadedOnce(false);
  };

  const handleUpload = async () => {
    if (!selectedFile) { toast({ title: "No file selected", description: "Please select a receipt to upload", variant: "destructive" }); return; }
    if (uploadedOnce) { toast({ title: "Already processed", description: "This receipt was already uploaded" }); return; }

    setLoading(true);
    try {
      const fd = new FormData();
      fd.append("receipt", selectedFile);
      if (manualData.merchant) fd.append("merchant", manualData.merchant);
      if (manualData.amount) fd.append("amount", manualData.amount);
      if (manualData.category) fd.append("category", manualData.category);
      if (manualData.date) fd.append("date", manualData.date);

      const res = await expensesAPI.uploadReceipt(fd);
      const result = (res.data && res.data.data) ? res.data.data : res.data;
      setOcrResult(result);

      // If backend already created expense (id/_id present) => no create
      const alreadyCreated = !!(result && (result.id || result._id));
      const amountNum = Number(result?.amount ?? manualData.amount ?? 0);
      const merchant = result?.merchant || manualData.merchant || "Receipt";
      const category = result?.category || manualData.category || "Others";
      const date = result?.date ? String(result.date).split("T")[0] : manualData.date;

      if (alreadyCreated) {
        setUploadedOnce(true);
        window.dispatchEvent(new Event("expensesUpdated"));
        toast({ title: "Receipt saved", description: "Saved by server" });
      } else if (amountNum > 0) {
        try {
          await expensesAPI.create({ merchant, amount: amountNum, category, date });
          setUploadedOnce(true);
          window.dispatchEvent(new Event("expensesUpdated"));
          toast({ title: "Receipt saved as expense", description: `Rp ${amountNum.toLocaleString("id-ID")}` });
        } catch (err) {
          console.warn("Create error:", err);
          setUploadedOnce(true);
          window.dispatchEvent(new Event("expensesUpdated"));
          toast({ title: "Receipt processed", description: "Saved receipt but failed to auto-create expense" });
        }
      } else {
        toast({ title: "Amount not detected", description: "Please enter amount manually and press Process" });
      }

      setTimeout(() => navigate("/finance"), 700);
    } catch (err: any) {
      console.error("Upload failed:", err);
      toast({ title: "Upload failed", description: err.response?.data?.message || "Could not process receipt", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => {
    setSelectedFile(null);
    setPreviewUrl("");
    setOcrResult(null);
    setManualData({ merchant: "", amount: "", category: "Food", date: new Date().toISOString().split("T")[0] });
    if (fileInputRef.current) fileInputRef.current.value = "";
    setUploadedOnce(false);
  };

  return (
    <div className="min-h-screen pb-24 md:pb-32 bg-gradient-to-br from-background via-wellness-peach/10 to-wellness-orange/10">
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
          <Button variant="ghost" onClick={() => navigate("/finance")} className="mb-4 -ml-2"><ArrowLeft className="w-5 h-5 mr-2" />Back to Finance</Button>
          <h1 className="text-3xl md:text-4xl font-bold mb-2"><span className="bg-gradient-to-r from-wellness-orange to-wellness-pink bg-clip-text text-transparent">Smart Receipt Scanner</span></h1>
          <p className="text-muted-foreground">Upload your receipt and we'll automatically extract the details</p>
        </motion.div>

        {!selectedFile ? (
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.1 }} className="card-wellness">
            <div onClick={() => fileInputRef.current?.click()} className="border-2 border-dashed rounded-2xl p-12 text-center cursor-pointer hover:border-primary">
              <Camera className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-semibold mb-2">Upload Receipt</h3>
              <p className="text-sm text-muted-foreground mb-4">Click to select or drag and drop</p>
              <p className="text-xs text-muted-foreground">Supports: JPG, PNG, PDF (max 10MB)</p>
            </div>
            <input ref={fileInputRef} type="file" accept="image/*,application/pdf" onChange={handleFileSelect} className="hidden" />
          </motion.div>
        ) : (
          <>
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="card-wellness mb-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold">Receipt Preview</h3>
                <Button variant="ghost" size="sm" onClick={handleClear}><X className="w-4 h-4 mr-1" />Clear</Button>
              </div>
              {previewUrl ? <img src={previewUrl} alt="Receipt preview" className="w-full rounded-xl object-contain max-h-96" /> : <div className="bg-secondary/30 rounded-xl p-8 text-center"><Upload className="w-12 h-12 mx-auto mb-2" /><p className="text-sm text-muted-foreground">{selectedFile.name}</p></div>}
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="card-wellness mb-6">
              <h3 className="font-semibold mb-4">Manual Input (Optional)</h3>
              <div className="space-y-4">
                <div><Label>Merchant Name</Label><Input placeholder="e.g., Cafe" value={manualData.merchant} onChange={(e) => setManualData(s => ({...s, merchant: e.target.value}))} /></div>
                <div><Label>Amount (Rp)</Label><Input type="number" placeholder="50000" value={manualData.amount} onChange={(e) => setManualData(s => ({...s, amount: e.target.value}))} /></div>
                <div><Label>Category</Label><Select value={manualData.category} onValueChange={(val) => setManualData(s => ({...s, category: val as CategoryType}))}><SelectTrigger className="rounded-xl"><SelectValue /></SelectTrigger><SelectContent>{categories.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent></Select></div>
                <div><Label>Date</Label><Input type="date" value={manualData.date} onChange={(e) => setManualData(s => ({...s, date: e.target.value}))} /></div>
              </div>
            </motion.div>

            {ocrResult && <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="card-wellness mb-6 bg-green-50"><div className="flex items-center gap-3 mb-4"><CheckCircle className="w-6 h-6 text-green-600" /><h3 className="font-semibold text-green-800">Receipt Processed Successfully!</h3></div><div className="space-y-2 text-sm"><div className="flex justify-between"><span className="text-muted-foreground">Merchant:</span><span className="font-medium">{ocrResult.merchant}</span></div><div className="flex justify-between"><span className="text-muted-foreground">Amount:</span><span className="font-bold text-green-600">Rp {Number(ocrResult.amount || 0).toLocaleString("id-ID")}</span></div><div className="flex justify-between"><span className="text-muted-foreground">Category:</span><span className="font-medium">{ocrResult.category}</span></div></div></motion.div>}

            <Button onClick={handleUpload} disabled={loading || uploadedOnce} className="w-full btn-wellness h-12 text-lg">{loading ? (<><Loader className="w-5 h-5 mr-2 animate-spin" />Processing Receipt...</>) : (<><Upload className="w-5 h-5 mr-2" />Process & Save Receipt</>)}</Button>
          </>
        )}

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="mt-6 p-4 rounded-xl bg-blue-50 border border-blue-200"><h4 className="font-semibold text-blue-800 mb-2">💡 Tips for Better Results:</h4><ul className="text-sm text-blue-700 space-y-1"><li>• Take a clear, well-lit photo of the receipt</li><li>• Make sure the entire receipt is visible</li><li>• Avoid shadows and reflections</li><li>• Keep the camera steady and focused</li></ul></motion.div>
      </div>

      <Navigation />
    </div>
  );
};

export default UploadReceipt;