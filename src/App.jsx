import { lazy, Suspense, useState, useMemo, useEffect, useCallback, useRef } from "react"

import Header from "./components/layout/Header"
import Card from "./components/ui/Card"

import { useAuth } from "./hooks/useAuth"
import {
  addDebtPayment,
  addGoalContribution,
  createTransactionFromRule,
  deleteCategory,
  deleteDebt,
  deleteGoal,
  deleteReceiptFile,
  deleteTransaction,
  deleteTransactions,
  extractReceiptFromImage,
  getReceiptUrl,
  linkReceiptToTransaction,
  loadBudgetData,
  loadDebts,
  saveCategory,
  saveDebt,
  saveGoal,
  saveReceiptFile,
  saveRecurringRule,
  saveTransaction,
  saveTransactions,
  sendCoachMessage,
  settleDebt,
  updateProfile,
  updateTransactions,
  loadCreditCards,
  saveCreditCard,
  deleteCreditCard,
} from "./services/budgetService"
import { loadAssets, saveAsset, deleteAsset } from "./services/assetService"
import { loadStoredNotifications, markStoredNotificationRead } from "./services/notificationService"
import { PALETTE, FONT_BODY, S, btnPrimary } from "./constants/theme"
import { today, sum } from "./utils/helpers"
import { extractReceiptFieldsFromText, suggestCategory } from "./utils/categorySuggestions"
import { buildNotifications } from "./utils/notifications"
import { useTheme } from "./hooks/useTheme"

const Dashboard = lazy(() => import("./components/dashboard/Dashboard"))
const Transactions = lazy(() => import("./components/transactions/Transactions"))
const Categories = lazy(() => import("./components/categories/Categories"))
const Goals = lazy(() => import("./components/goals/Goals"))
const Reports = lazy(() => import("./components/reports/Reports"))
const BudgetCalendar = lazy(() => import("./components/calendar/BudgetCalendar"))
const Receipts = lazy(() => import("./components/receipts/Receipts"))
const SubscriptionPlans = lazy(() => import("./components/plans/SubscriptionPlans"))
const AICoach = lazy(() => import("./components/coach/AICoach"))
const RecurringRules = lazy(() => import("./components/recurring/RecurringRules"))
const Notifications = lazy(() => import("./components/notifications/Notifications"))
const Subscriptions = lazy(() => import("./components/subscriptions/Subscriptions"))
const AuthScreen = lazy(() => import("./components/auth/AuthScreen"))
const LandingPage = lazy(() => import("./components/auth/LandingPage"))
const PublicInfoPage = lazy(() => import("./components/auth/PublicInfoPage"))
const Account = lazy(() => import("./components/account/Account"))
const DebtTracker = lazy(() => import("./components/debts/DebtTracker"))
const CurrencyRates = lazy(() => import("./components/currency/CurrencyRates"))
const Assets = lazy(() => import("./components/assets/Assets"))
const CreditCards = lazy(() => import("./components/creditcards/CreditCards"))
const AdminPanel = lazy(() => import("./components/admin/AdminPanel"))

export default function App() {
  const { user, loading: authLoading, isAdmin, isBanned, isConfigured } = useAuth()
  const userId = user?.id || null
  const { theme, toggleTheme } = useTheme()

  const [txs, setTxs] = useState([])
  const [cats, setCats] = useState([])
  const [goals, setGoals] = useState([])
  const [contributions, setContributions] = useState([])
  const [recurringRules, setRecurringRules] = useState([])
  const [receipts, setReceipts] = useState([])
  const [aiInsights, setAiInsights] = useState([])
  const [aiMessages, setAiMessages] = useState([])
  const [currentAiConversationId, setCurrentAiConversationId] = useState(null)
  const [profile, setProfile] = useState(null)
  const [debts, setDebts] = useState([])
  const [debtPayments, setDebtPayments] = useState([])
  const [assets, setAssets] = useState([])
  const [creditCards, setCreditCards] = useState([])
  const [storedNotifications, setStoredNotifications] = useState([])
  const [view, setView] = useState("dashboard")
  const [dataLoading, setDataLoading] = useState(false)
  const [actionLoading, setActionLoading] = useState(false)
  const [error, setError] = useState("")
  const [notice, setNotice] = useState("")
  const [publicView, setPublicView] = useState("landing")
  const [authMode, setAuthMode] = useState("login")
  const [hasLoadedData, setHasLoadedData] = useState(false)
  const refreshPromiseRef = useRef(null)
  const refreshSeqRef = useRef(0)

  const [showTxModal, setShowTxModal] = useState(false)
  const [editTx, setEditTx] = useState(null)
  const [txForm, setTxForm] = useState({
    type: "expense",
    amount: "",
    date: "",
    cat: "",
    desc: "",
    paymentMethod: "Kart",
    tags: "",
    receiptId: "",
    originalCurrency: "TRY",
    originalAmount: null,
    location: "",
  })

  const [showCatModal, setShowCatModal] = useState(false)
  const [editCat, setEditCat] = useState(null)
  const [catForm, setCatForm] = useState({
    name: "",
    color: PALETTE[0],
    isIncome: false,
    budget: "",
    icon: "",
  })

  const [filters, setFilters] = useState({
    type: "",
    cat: "",
    from: "",
    to: "",
    q: "",
    paymentMethod: "",
  })

  useEffect(() => {
    const el = document.createElement("link")
    el.rel = "stylesheet"
    el.href =
      "https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600;700&display=swap"
    document.head.appendChild(el)
    return () => el.remove()
  }, [])

  const refreshData = useCallback(async () => {
    if (!user) return
    if (refreshPromiseRef.current) return refreshPromiseRef.current

    const requestSeq = refreshSeqRef.current + 1
    refreshSeqRef.current = requestSeq
    setDataLoading(true)
    setError("")

    const refreshPromise = Promise.all([
      loadBudgetData(user),
      loadDebts(user.id).catch(() => ({ debts: [], debtPayments: [] })),
      loadAssets(user.id).catch(() => []),
      loadCreditCards(user.id).catch(() => []),
      loadStoredNotifications(user.id).catch(() => []),
    ])
      .then(([data, debtData, assetRows, creditCardRows, notificationRows]) => {
        if (refreshSeqRef.current !== requestSeq) return
        setProfile(data.profile)
        setCats(data.cats)
        setTxs(data.txs)
        setGoals(data.goals)
        setContributions(data.contributions)
        setRecurringRules(data.recurringRules)
        setReceipts(data.receipts || [])
        setAiInsights(data.aiInsights)
        setDebts(debtData.debts)
        setDebtPayments(debtData.debtPayments)
        setAssets(assetRows)
        setCreditCards(creditCardRows)
        setStoredNotifications(notificationRows)
        setHasLoadedData(true)
      })
      .catch((err) => {
        if (refreshSeqRef.current !== requestSeq) return
        const message = err.message || "Veriler yüklenirken bir hata oluştu."
        setError(message)
      })
      .finally(() => {
        if (refreshSeqRef.current === requestSeq) {
          setDataLoading(false)
        }
        refreshPromiseRef.current = null
      })

    refreshPromiseRef.current = refreshPromise
    return refreshPromise
  }, [user])

  useEffect(() => {
    setAiMessages([])
    setCurrentAiConversationId(null)

    if (!user) {
      refreshSeqRef.current += 1
      refreshPromiseRef.current = null
      setTxs([])
      setCats([])
      setGoals([])
      setContributions([])
      setRecurringRules([])
      setReceipts([])
      setAiInsights([])
      setAiMessages([])
      setCurrentAiConversationId(null)
      setProfile(null)
      setDebts([])
      setDebtPayments([])
      setAssets([])
      setCreditCards([])
      setStoredNotifications([])
      setHasLoadedData(false)
      setDataLoading(false)
      setView("dashboard")
      return
    }
    refreshData()
  }, [userId, refreshData])

  const catById = (id) => cats.find((c) => c.id === id)
  const activeCats = cats.filter((cat) => !cat.isArchived)
  const totalIncome = useMemo(() => sum(txs.filter((t) => t.type === "income")), [txs])
  const totalExpense = useMemo(() => sum(txs.filter((t) => t.type === "expense")), [txs])
  const balance = totalIncome - totalExpense
  const notificationCount = useMemo(
    () =>
      buildNotifications({ txs, cats, goals, recurringRules }).filter((item) => item.severity !== "info").length +
      storedNotifications.filter((item) => !item.isRead).length,
    [txs, cats, goals, recurringRules, storedNotifications]
  )

  const catSpend = useMemo(() => {
    const map = {}
    txs.filter((t) => t.type === "expense").forEach((t) => {
      map[t.cat] = (map[t.cat] || 0) + t.amount
    })
    return map
  }, [txs])

  const showError = (message) => {
    setError(message)
    setNotice("")
  }

  const showNotice = (message) => {
    setNotice(message)
    setError("")
  }

  useEffect(() => {
    if (!notice) return undefined
    const timeoutId = window.setTimeout(() => setNotice(""), 4000)
    return () => window.clearTimeout(timeoutId)
  }, [notice])

  useEffect(() => {
    setNotice("")
  }, [view])

  const openAddTx = () => {
    setTxForm({
      type: "expense",
      amount: "",
      date: today(),
      cat: "",
      desc: "",
      paymentMethod: "Kart",
      tags: "",
      receiptId: "",
      originalCurrency: "TRY",
      originalAmount: null,
      location: "",
    })
    setEditTx(null)
    setShowTxModal(true)
  }

  const openEditTx = (t) => {
    setTxForm({
      type: t.type,
      amount: String(t.amount),
      date: t.date,
      cat: t.cat,
      desc: t.desc || "",
      paymentMethod: t.paymentMethod || "Kart",
      tags: (t.tags || []).join(", "),
      receiptId: receipts.find((receipt) => receipt.transactionId === t.id)?.id || "",
      originalCurrency: t.originalCurrency || "TRY",
      originalAmount: t.originalAmount != null ? String(t.originalAmount) : null,
      location: t.location || "",
    })
    setEditTx(t)
    setShowTxModal(true)
  }

  const saveTx = async () => {
    if (!txForm.amount || !txForm.cat) return
    const amount = parseFloat(txForm.amount)
    if (!Number.isFinite(amount) || amount < 0) {
      showError("Lütfen geçerli bir tutar girin.")
      return
    }

    const data = {
      type: txForm.type,
      amount,
      date: txForm.date || today(),
      cat: txForm.cat,
      desc: txForm.desc,
      paymentMethod: txForm.paymentMethod || "Kart",
      tags: (txForm.tags || "").split(",").map((tag) => tag.trim()).filter(Boolean),
      originalCurrency: txForm.originalCurrency || "TRY",
      originalAmount: txForm.originalCurrency && txForm.originalCurrency !== "TRY" && txForm.originalAmount
        ? parseFloat(txForm.originalAmount) || null
        : null,
      location: txForm.location?.trim() || null,
    }

    setActionLoading(true)
    try {
      const saved = await saveTransaction(user.id, data, editTx?.id)
      if (txForm.receiptId) {
        const linkedReceipt = await linkReceiptToTransaction(user.id, txForm.receiptId, saved.id)
        if (linkedReceipt) {
          setReceipts((prev) => prev.map((receipt) => receipt.id === linkedReceipt.id ? linkedReceipt : receipt))
        }
      }
      setTxs((prev) => editTx ? prev.map((t) => t.id === editTx.id ? saved : t) : [saved, ...prev])
      setShowTxModal(false)
      showNotice(editTx ? "İşlem güncellendi." : "İşlem eklendi.")
    } catch (err) {
      showError(err.message || "İşlem kaydedilemedi.")
    } finally {
      setActionLoading(false)
    }
  }

  const handleReceiptUpload = async (file) => {
    if (!file) return
    setActionLoading(true)
    try {
      const imageDataUrl = file.type?.startsWith("image/") ? await readFileAsDataUrl(file) : ""
      const extracted = imageDataUrl ? await extractReceiptFromImage(imageDataUrl, file.name) : {}
      const fallback = extractReceiptFieldsFromText(file.name)
      const amount = Number(extracted?.amount || fallback.amount || 0)
      const desc = extracted?.merchant || fallback.merchant || file.name.replace(/\.[^.]+$/, "")
      const date = extracted?.date || fallback.date || today()
      const suggested = suggestCategory({ description: desc, cats: activeCats, type: "expense" })
      const tags = ["fiş", ...(suggested?.tags || [])]
      const items = extracted?.items || []
      const itemsNote = items.length > 0
        ? items.map((it) => `• ${it.name}${it.qty !== 1 ? ` x${it.qty}` : ""} — ${formatCurrency(it.totalPrice)}`).join("\n")
        : ""
      const notes = [extracted?.notes, itemsNote].filter(Boolean).join("\n")
      const receipt = await saveReceiptFile(user.id, file, {
        merchant: desc,
        amount,
        date,
        paymentMethod: extracted?.paymentMethod || suggested?.paymentMethod || "Kart",
        notes,
        confidence: extracted?.confidence || 0,
        items,
      })
      setReceipts((prev) => [receipt, ...prev])

      setTxForm({
        type: "expense",
        amount: amount ? String(amount) : "",
        date,
        cat: suggested?.cat?.id || "",
        desc,
        paymentMethod: extracted?.paymentMethod || suggested?.paymentMethod || "Kart",
        tags: [...new Set(tags)].join(", "),
        receiptId: receipt.id,
      })
      setEditTx(null)
      setShowTxModal(true)
      showNotice(
        amount
          ? `Fiş arşive kaydedildi: ${desc} · ${formatCurrency(amount)}. Kontrol edip kaydedebilirsiniz.`
          : "Fiş arşive kaydedildi. Okunamayan alanları kontrol edip tamamlayabilirsiniz."
      )
    } catch (err) {
      const fallback = extractReceiptFieldsFromText(file.name)
      const suggested = suggestCategory({ description: fallback.merchant || file.name, cats: activeCats, type: "expense" })
      try {
        const receipt = await saveReceiptFile(user.id, file, {
          merchant: fallback.merchant || file.name.replace(/\.[^.]+$/, ""),
          amount: fallback.amount,
          date: fallback.date || "",
          paymentMethod: suggested?.paymentMethod || "Kart",
          notes: err.message || "Otomatik okuma tamamlanamadı.",
          confidence: 0,
        })
        setReceipts((prev) => [receipt, ...prev])
        setTxForm({
          type: "expense",
          amount: fallback.amount ? String(fallback.amount) : "",
          date: fallback.date || today(),
          cat: suggested?.cat?.id || "",
          desc: fallback.merchant || file.name.replace(/\.[^.]+$/, ""),
          paymentMethod: suggested?.paymentMethod || "Kart",
          tags: ["fiş", ...(suggested?.tags || [])].join(", "),
          receiptId: receipt.id,
        })
        setEditTx(null)
        setShowTxModal(true)
        showNotice("Fiş arşive kaydedildi; dosya adından tahmin edilen formu açtım.")
      } catch (storageErr) {
        showError(storageErr.message || "Fiş arşive kaydedilemedi.")
      }
    } finally {
      setActionLoading(false)
    }
  }

  const handleUseReceipt = (receipt) => {
    const suggested = suggestCategory({ description: receipt.merchant || receipt.fileName, cats: activeCats, type: "expense" })
    setTxForm({
      type: "expense",
      amount: receipt.amount ? String(receipt.amount) : "",
      date: receipt.date || today(),
      cat: suggested?.cat?.id || "",
      desc: receipt.merchant || receipt.fileName.replace(/\.[^.]+$/, ""),
      paymentMethod: receipt.paymentMethod || suggested?.paymentMethod || "Kart",
      tags: ["fiş", ...(suggested?.tags || [])].join(", "),
      receiptId: receipt.id,
    })
    setEditTx(null)
    setView("transactions")
    setShowTxModal(true)
  }

  const handleOpenReceipt = async (receipt) => {
    setActionLoading(true)
    try {
      const url = await getReceiptUrl(user.id, receipt)
      window.open(url, "_blank", "noopener,noreferrer")
    } catch (err) {
      showError(err.message || "Fiş açılamadı.")
    } finally {
      setActionLoading(false)
    }
  }

  const handleGetReceiptUrl = (receipt) => getReceiptUrl(user.id, receipt)

  const handleDeleteReceipt = async (receipt) => {
    const ok = window.confirm(`${receipt.fileName} arşivden silinsin mi?`)
    if (!ok) return
    setActionLoading(true)
    try {
      await deleteReceiptFile(user.id, receipt)
      setReceipts((prev) => prev.filter((item) => item.id !== receipt.id))
      showNotice("Fiş arşivden silindi.")
    } catch (err) {
      showError(err.message || "Fiş silinemedi.")
    } finally {
      setActionLoading(false)
    }
  }

  const deleteTx = async (id) => {
    setActionLoading(true)
    try {
      await deleteTransaction(user.id, id)
      setTxs((prev) => prev.filter((t) => t.id !== id))
      setReceipts((prev) => prev.map((receipt) => receipt.transactionId === id ? { ...receipt, transactionId: "" } : receipt))
      showNotice("İşlem silindi.")
    } catch (err) {
      showError(err.message || "İşlem silinemedi.")
    } finally {
      setActionLoading(false)
    }
  }

  const deleteManyTx = async (ids) => {
    if (ids.length === 0) return
    setActionLoading(true)
    try {
      await deleteTransactions(user.id, ids)
      setTxs((prev) => prev.filter((t) => !ids.includes(t.id)))
      setReceipts((prev) => prev.map((receipt) => ids.includes(receipt.transactionId) ? { ...receipt, transactionId: "" } : receipt))
      showNotice(`${ids.length} işlem silindi.`)
    } catch (err) {
      showError(err.message || "İşlemler silinemedi.")
    } finally {
      setActionLoading(false)
    }
  }

  const updateManyTx = async (ids, patch) => {
    if (ids.length === 0) return
    setActionLoading(true)
    try {
      const updated = await updateTransactions(user.id, ids, patch)
      const map = new Map(updated.map((tx) => [tx.id, tx]))
      setTxs((prev) => prev.map((tx) => map.get(tx.id) || tx))
      showNotice(`${updated.length} işlem güncellendi.`)
    } catch (err) {
      showError(err.message || "İşlemler güncellenemedi.")
    } finally {
      setActionLoading(false)
    }
  }

  const openAddCat = () => {
    setCatForm({ name: "", color: PALETTE[0], isIncome: false, budget: "", icon: "" })
    setEditCat(null)
    setShowCatModal(true)
  }

  const openEditCat = (c) => {
    setCatForm({
      name: c.name,
      color: c.color,
      isIncome: c.isIncome,
      budget: String(c.budget || ""),
      icon: c.icon || "",
    })
    setEditCat(c)
    setShowCatModal(true)
  }

  const saveCat = async () => {
    if (!catForm.name) return
    const data = {
      name: catForm.name,
      color: catForm.color,
      isIncome: catForm.isIncome,
      budget: parseFloat(catForm.budget) || 0,
      icon: catForm.icon || (catForm.isIncome ? "Gelir" : "Gider"),
      isArchived: false,
    }

    setActionLoading(true)
    try {
      const saved = await saveCategory(user.id, data, editCat?.id)
      setCats((prev) => editCat ? prev.map((c) => c.id === editCat.id ? saved : c) : [...prev, saved])
      setShowCatModal(false)
      showNotice(editCat ? "Kategori güncellendi." : "Kategori eklendi.")
    } catch (err) {
      showError(err.message || "Kategori kaydedilemedi.")
    } finally {
      setActionLoading(false)
    }
  }

  const deleteCat = async (id) => {
    setActionLoading(true)
    try {
      await deleteCategory(user.id, id)
      setCats((prev) => prev.map((c) => c.id === id ? { ...c, isArchived: true } : c))
      showNotice("Kategori geçmiş işlemleri korumak için pasifleştirildi.")
    } catch (err) {
      showError(err.message || "Kategori pasifleştirilemedi.")
    } finally {
      setActionLoading(false)
    }
  }

  const handleProfileUpdate = async (values) => {
    const nextProfile = await updateProfile(user.id, values)
    setProfile(nextProfile)
  }

  const handleSaveGoal = async (goal, editId) => {
    setActionLoading(true)
    try {
      const saved = await saveGoal(user.id, goal, editId)
      setGoals((prev) => editId ? prev.map((item) => item.id === editId ? saved : item) : [saved, ...prev])
      showNotice(editId ? "Hedef güncellendi." : "Hedef eklendi.")
    } catch (err) {
      showError(err.message || "Hedef kaydedilemedi.")
    } finally {
      setActionLoading(false)
    }
  }

  const handleAddContribution = async (contribution) => {
    setActionLoading(true)
    try {
      const saved = await addGoalContribution(user.id, contribution)
      setContributions((prev) => [saved, ...prev])
      setGoals((prev) => prev.map((goal) =>
        goal.id === contribution.goalId ? { ...goal, currentAmount: goal.currentAmount + contribution.amount } : goal
      ))
      showNotice("Hedef katkısı eklendi.")
    } catch (err) {
      showError(err.message || "Katkı eklenemedi.")
    } finally {
      setActionLoading(false)
    }
  }

  const handleDeleteGoal = async (id) => {
    setActionLoading(true)
    try {
      await deleteGoal(user.id, id)
      setGoals((prev) => prev.map((goal) => goal.id === id ? { ...goal, isArchived: true } : goal))
      showNotice("Hedef kaldırıldı.")
    } catch (err) {
      showError(err.message || "Hedef kaldırılamadı.")
    } finally {
      setActionLoading(false)
    }
  }

  const handleSaveDebt = async (debt, editId) => {
    setActionLoading(true)
    try {
      const saved = await saveDebt(user.id, debt, editId)
      setDebts((prev) => editId ? prev.map((d) => d.id === editId ? saved : d) : [saved, ...prev])
      showNotice(editId ? "Borç güncellendi." : "Borç eklendi.")
    } catch (err) {
      showError(err.message || "Borç kaydedilemedi.")
    } finally {
      setActionLoading(false)
    }
  }

  const handleDeleteDebt = async (id) => {
    const ok = window.confirm("Bu borç kaydı silinsin mi?")
    if (!ok) return
    setActionLoading(true)
    try {
      await deleteDebt(user.id, id)
      setDebts((prev) => prev.filter((d) => d.id !== id))
      setDebtPayments((prev) => prev.filter((p) => p.debtId !== id))
      showNotice("Borç silindi.")
    } catch (err) {
      showError(err.message || "Borç silinemedi.")
    } finally {
      setActionLoading(false)
    }
  }

  const handleSaveAsset = async (asset, editId) => {
    setActionLoading(true)
    try {
      const saved = await saveAsset(user.id, asset, editId)
      setAssets((prev) => editId ? prev.map((a) => a.id === editId ? saved : a) : [saved, ...prev])
      showNotice(editId ? "Varlık güncellendi." : "Varlık eklendi.")
    } catch (err) {
      showError(err.message || "Varlık kaydedilemedi.")
    } finally {
      setActionLoading(false)
    }
  }

  const handleDeleteAsset = async (id) => {
    const ok = window.confirm("Bu varlık silinsin mi?")
    if (!ok) return
    setActionLoading(true)
    try {
      await deleteAsset(user.id, id)
      setAssets((prev) => prev.filter((a) => a.id !== id))
      showNotice("Varlık silindi.")
    } catch (err) {
      showError(err.message || "Varlık silinemedi.")
    } finally {
      setActionLoading(false)
    }
  }

  const handleSaveCreditCard = async (card, editId) => {
    setActionLoading(true)
    try {
      const saved = await saveCreditCard(user.id, card, editId)
      setCreditCards((prev) =>
        editId ? prev.map((c) => c.id === editId ? saved : c) : [...prev, saved]
      )
      showNotice(editId ? "Kart güncellendi." : "Kart eklendi.")
    } catch (err) {
      showError(err.message || "Kart kaydedilemedi.")
    } finally {
      setActionLoading(false)
    }
  }

  const handleDeleteCreditCard = async (id) => {
    const ok = window.confirm("Bu kredi kartı silinsin mi?")
    if (!ok) return
    setActionLoading(true)
    try {
      await deleteCreditCard(user.id, id)
      setCreditCards((prev) => prev.filter((c) => c.id !== id))
      showNotice("Kart silindi.")
    } catch (err) {
      showError(err.message || "Kart silinemedi.")
    } finally {
      setActionLoading(false)
    }
  }

  const handleSettleDebt = async (id) => {
    setActionLoading(true)
    try {
      const saved = await settleDebt(user.id, id)
      setDebts((prev) => prev.map((d) => d.id === id ? saved : d))
      showNotice("Borç kapandı olarak işaretlendi.")
    } catch (err) {
      showError(err.message || "Borç güncellenemedi.")
    } finally {
      setActionLoading(false)
    }
  }

  const handleAddDebtPayment = async (payment) => {
    setActionLoading(true)
    try {
      const saved = await addDebtPayment(user.id, payment)
      setDebtPayments((prev) => [saved, ...prev])
      showNotice("Ödeme eklendi.")
    } catch (err) {
      showError(err.message || "Ödeme eklenemedi.")
    } finally {
      setActionLoading(false)
    }
  }

  const handleSaveRule = async (rule, editId) => {
    setActionLoading(true)
    try {
      const saved = await saveRecurringRule(user.id, rule, editId)
      setRecurringRules((prev) => editId ? prev.map((item) => item.id === editId ? saved : item) : [saved, ...prev])
      showNotice("Tekrarlı işlem şablonu kaydedildi.")
    } catch (err) {
      showError(err.message || "Tekrarlı işlem kaydedilemedi.")
    } finally {
      setActionLoading(false)
    }
  }

  const handleCreateFromRule = async (rule) => {
    setActionLoading(true)
    try {
      const tx = await createTransactionFromRule(user.id, rule)
      setTxs((prev) => [tx, ...prev])
      await refreshData()
      showNotice("Tekrarlı işlemden kayıt oluşturuldu.")
    } catch (err) {
      showError(err.message || "Tekrarlı işlem oluşturulamadı.")
    } finally {
      setActionLoading(false)
    }
  }

  const handleAskCoach = async (message, summary) => {
    setAiMessages((prev) => [
      ...prev,
      { id: `local-user-${Date.now()}`, role: "user", content: message, createdAt: new Date().toISOString() },
    ])
    try {
      const data = await sendCoachMessage(user.id, message, summary, currentAiConversationId)
      if (data?.conversationId) {
        setCurrentAiConversationId(data.conversationId)
      }
      if (data?.reply) {
        setAiMessages((prev) => [
          ...prev,
          { id: `local-assistant-${Date.now()}`, role: "assistant", content: data.reply, createdAt: new Date().toISOString() },
        ])
      }
      if (Array.isArray(data?.insights)) {
        setAiInsights((prev) => [
          ...data.insights.map((item, index) => ({ id: `local-insight-${Date.now()}-${index}`, createdAt: new Date().toISOString(), ...item })),
          ...prev,
        ])
      }
    } catch (err) {
      showError(err.message || "AI Koç yanıt veremedi.")
    }
  }

  const handleNewAiChat = () => {
    setAiMessages([])
    setCurrentAiConversationId(null)
  }

  const handleMarkNotificationRead = async (id) => {
    if (!user?.id) return
    try {
      const saved = await markStoredNotificationRead(user.id, id)
      setStoredNotifications((prev) => prev.map((item) => item.id === id ? saved : item))
    } catch (err) {
      showError(err.message || "Bildirim güncellenemedi.")
    }
  }

  const exportCSV = () => {
    const escapeCell = (value) => `"${String(value).replaceAll('"', '""')}"`
    const filtered = txs.filter((t) => {
      if (filters.type && t.type !== filters.type) return false
      if (filters.cat && t.cat !== filters.cat) return false
      if (filters.from && t.date < filters.from) return false
      if (filters.to && t.date > filters.to) return false
      if (filters.paymentMethod && t.paymentMethod !== filters.paymentMethod) return false
      if (filters.q) {
        const haystack = `${t.desc || ""} ${catById(t.cat)?.name || ""} ${(t.tags || []).join(" ")}`.toLowerCase()
        if (!haystack.includes(filters.q.toLowerCase())) return false
      }
      return true
    }).sort((a, b) => b.date.localeCompare(a.date))

    const header = "Tur,Tutar,Kategori,Tarih,Aciklama,Odeme,Etiketler"
    const rows = filtered.map((t) => {
      const c = catById(t.cat)
      return [
        t.type === "income" ? "Gelir" : "Gider",
        t.amount,
        c?.name || "",
        t.date,
        t.desc || "",
        t.paymentMethod || "",
        (t.tags || []).join("|"),
      ].map(escapeCell).join(",")
    })
    const blob = new Blob(["\uFEFF" + [header, ...rows].join("\n")], { type: "text/csv;charset=utf-8;" })
    const a = document.createElement("a")
    a.href = URL.createObjectURL(blob)
    a.download = "budgetassist.csv"
    a.click()
    URL.revokeObjectURL(a.href)
  }

  const importCSV = async (text) => {
    const rows = parseCSV(text)
    if (rows.length === 0) {
      showError("CSV dosyasında içe aktarılacak satır bulunamadı.")
      return
    }

    const header = rows[0].map((cell) => normalizeText(cell))
    const body = rows.slice(1).filter((row) => row.some((cell) => cell.trim()))
    const getIndex = (...names) => names.map((name) => header.indexOf(normalizeText(name))).find((index) => index >= 0)
    const idx = {
      type: getIndex("Tur", "Tür", "Type"),
      amount: getIndex("Tutar", "Amount"),
      cat: getIndex("Kategori", "Category"),
      date: getIndex("Tarih", "Date"),
      desc: getIndex("Aciklama", "Açıklama", "Description"),
      paymentMethod: getIndex("Odeme", "Ödeme", "Payment"),
      tags: getIndex("Etiketler", "Tags"),
    }

    if (idx.amount == null || idx.date == null || idx.cat == null) {
      showError("CSV için Tutar, Tarih ve Kategori sütunları gerekli.")
      return
    }

    const categoryMap = new Map(activeCats.map((cat) => [normalizeText(cat.name), cat]))
    const imported = []
    const skipped = []

    body.forEach((row, rowIndex) => {
      const rawAmount = row[idx.amount] || ""
      const amount = parseAmount(rawAmount)
      const rawDate = row[idx.date] || ""
      const date = parseDate(rawDate)
      const category = categoryMap.get(normalizeText(row[idx.cat] || ""))
      const rawType = idx.type == null ? "" : normalizeText(row[idx.type] || "")
      const type = rawType.includes("gelir") || rawType.includes("income") || rawAmount.trim().startsWith("+")
        ? "income"
        : "expense"

      if (!amount || !date || !category || category.isIncome !== (type === "income")) {
        skipped.push(rowIndex + 2)
        return
      }

      imported.push({
        type,
        amount,
        date,
        cat: category.id,
        desc: idx.desc == null ? "" : row[idx.desc] || "",
        paymentMethod: idx.paymentMethod == null ? "Kart" : row[idx.paymentMethod] || "Kart",
        tags: idx.tags == null
          ? []
          : (row[idx.tags] || "").split("|").flatMap((item) => item.split(",")).map((tag) => tag.trim()).filter(Boolean),
        source: "csv",
      })
    })

    if (imported.length === 0) {
      showError(`CSV içe aktarılamadı. ${skipped.length} satır kategori, tarih veya tutar eşleşmesi nedeniyle atlandı.`)
      return
    }

    setActionLoading(true)
    try {
      const saved = await saveTransactions(user.id, imported)
      setTxs((prev) => [...saved, ...prev].sort((a, b) => b.date.localeCompare(a.date)))
      showNotice(`${saved.length} işlem içe aktarıldı${skipped.length ? `, ${skipped.length} satır atlandı` : ""}.`)
    } catch (err) {
      showError(err.message || "CSV içe aktarılamadı.")
    } finally {
      setActionLoading(false)
    }
  }

  if (authLoading) {
    return <ShellMessage title="Oturum kontrol ediliyor" text="BudgetAssist hazırlanıyor..." />
  }

  if (isBanned) {
    return (
      <ShellMessage
        title="Hesabınız askıya alındı"
        text="Hesabınız bir yönetici tarafından askıya alınmıştır. Detaylı bilgi için destek ekibiyle iletişime geçin."
      />
    )
  }

  if (!user) {
    const openPublicPage = (nextView) => setPublicView(nextView)
    const openAuth = (mode) => {
      setAuthMode(mode)
      setPublicView("auth")
    }

    if (publicView === "auth") {
      return (
        <Suspense fallback={<ShellMessage title="Ekran yükleniyor" text="Giriş ekranı hazırlanıyor." />}>
          <AuthScreen
            isConfigured={isConfigured}
            initialMode={authMode}
            onBackLanding={() => setPublicView("landing")}
            onOpenPage={openPublicPage}
          />
        </Suspense>
      )
    }

    if (["privacy", "terms", "security", "contact"].includes(publicView)) {
      return (
        <Suspense fallback={<ShellMessage title="Sayfa yükleniyor" text="Bilgi sayfası hazırlanıyor." />}>
          <PublicInfoPage
            page={publicView}
            onBackLanding={() => setPublicView("landing")}
            onLogin={() => openAuth("login")}
            onSignup={() => openAuth("signup")}
            onOpenPage={openPublicPage}
          />
        </Suspense>
      )
    }

    return (
      <Suspense fallback={<ShellMessage title="BudgetAssist" text="Ana sayfa hazırlanıyor." />}>
        <LandingPage
          onLogin={() => openAuth("login")}
          onSignup={() => openAuth("signup")}
          onOpenPage={openPublicPage}
        />
      </Suspense>
    )
  }

  if (view === "admin") {
    return (
      <Suspense fallback={<ShellMessage title="Admin Console" text="Panel yükleniyor." />}>
        <AdminPanel
          user={user}
          isAdmin={isAdmin}
          loading={authLoading}
          setView={setView}
        />
      </Suspense>
    )
  }

  return (
    <div className="app-shell" style={{ fontFamily: FONT_BODY }}>
      <Header
        view={view}
        setView={setView}
        balance={balance}
        notificationCount={notificationCount}
        onAddTx={openAddTx}
        user={user}
        isAdmin={isAdmin}
        disabled={actionLoading || activeCats.length === 0}
        theme={theme}
        toggleTheme={toggleTheme}
      />

      <main className="app-main">
        <div className="app-main-inner" key={view}>
          {(error || notice || actionLoading) && (
            <div style={{ marginBottom: 16 }}>
              {error && <Status tone="error">{error}</Status>}
              {notice && <Status tone="success">{notice}</Status>}
              {actionLoading && <Status>İşlem kaydediliyor...</Status>}
            </div>
          )}

          <Suspense fallback={<ShellMessage compact title="Ekran yükleniyor" text="Bölüm hazırlanıyor." />}>
            {dataLoading && !hasLoadedData ? (
              <ShellMessage compact title="Veriler yükleniyor" text="Hesabınıza ait kayıtlar hazırlanıyor." />
            ) : (
              <>
              {view === "dashboard" && <Dashboard txs={txs} cats={cats} catById={catById} setView={setView} />}
              {view === "notifications" && (
                <Notifications
                  txs={txs}
                  cats={cats}
                  goals={goals}
                  recurringRules={recurringRules}
                  storedNotifications={storedNotifications}
                  onMarkRead={handleMarkNotificationRead}
                  setView={setView}
                />
              )}
              {view === "reports" && <Reports txs={txs} cats={cats} />}
              {view === "receipts" && (
                <Receipts
                  receipts={receipts}
                  txs={txs}
                  onUpload={handleReceiptUpload}
                  onOpen={handleOpenReceipt}
                  onUse={handleUseReceipt}
                  onDelete={handleDeleteReceipt}
                  onGetUrl={handleGetReceiptUrl}
                />
              )}
              {view === "plans" && (
                <SubscriptionPlans
                  currentPlan="premium"
                  onBackAccount={() => setView("account")}
                />
              )}
              {view === "calendar" && (
                <BudgetCalendar
                  txs={txs}
                  cats={cats}
                  goals={goals}
                  recurringRules={recurringRules}
                  setView={setView}
                />
              )}
              {view === "subscriptions" && (
                <Subscriptions cats={activeCats} rules={recurringRules} onSaveRule={handleSaveRule} onCreateFromRule={handleCreateFromRule} />
              )}
              {view === "transactions" && (
                <>
                  <Transactions
                    txs={txs}
                    cats={activeCats}
                    receipts={receipts}
                    catById={catById}
                    showModal={showTxModal}
                    editTx={editTx}
                    txForm={txForm}
                    setTxForm={setTxForm}
                    filters={filters}
                    setFilters={setFilters}
                    onAdd={openAddTx}
                    onEdit={openEditTx}
                    onSave={saveTx}
                    onDelete={deleteTx}
                    onBulkDelete={deleteManyTx}
                    onBulkUpdate={updateManyTx}
                    onClose={() => setShowTxModal(false)}
                    exportCSV={exportCSV}
                    importCSV={importCSV}
                    onOpenReceipt={handleOpenReceipt}
                  />
                  <RecurringRules cats={activeCats} rules={recurringRules} onSaveRule={handleSaveRule} onCreateFromRule={handleCreateFromRule} />
                </>
              )}
              {view === "categories" && (
                <Categories
                  cats={cats}
                  catSpend={catSpend}
                  showModal={showCatModal}
                  editCat={editCat}
                  catForm={catForm}
                  setCatForm={setCatForm}
                  onAdd={openAddCat}
                  onEdit={openEditCat}
                  onSave={saveCat}
                  onDelete={deleteCat}
                  onClose={() => setShowCatModal(false)}
                />
              )}
              {view === "goals" && (
                <Goals
                  cats={cats}
                  catSpend={catSpend}
                  goals={goals}
                  contributions={contributions}
                  onSaveGoal={handleSaveGoal}
                  onDeleteGoal={handleDeleteGoal}
                  onAddContribution={handleAddContribution}
                  setView={setView}
                />
              )}
              {view === "coach" && (
                <AICoach
                  txs={txs}
                  cats={cats}
                  goals={goals}
                  recurringRules={recurringRules}
                  profile={profile}
                  debts={debts}
                  debtPayments={debtPayments}
                  assets={assets}
                  creditCards={creditCards}
                  aiMessages={aiMessages}
                  aiInsights={aiInsights}
                  onAskCoach={handleAskCoach}
                  onNewChat={handleNewAiChat}
                />
              )}
              {view === "assets" && (
                <Assets
                  assets={assets}
                  onSaveAsset={handleSaveAsset}
                  onDeleteAsset={handleDeleteAsset}
                />
              )}
              {view === "debts" && (
                <DebtTracker
                  debts={debts}
                  debtPayments={debtPayments}
                  onSaveDebt={handleSaveDebt}
                  onDeleteDebt={handleDeleteDebt}
                  onSettleDebt={handleSettleDebt}
                  onAddPayment={handleAddDebtPayment}
                />
              )}
              {view === "creditcards" && (
                <CreditCards
                  creditCards={creditCards}
                  onSave={handleSaveCreditCard}
                  onDelete={handleDeleteCreditCard}
                  theme={theme}
                />
              )}
              {view === "currency" && <CurrencyRates />}
              {view === "account" && (
                <Account
                  user={user}
                  profile={profile}
                  txs={txs}
                  cats={cats}
                  balance={balance}
                  onProfileUpdate={handleProfileUpdate}
                  onOpenPlans={() => setView("plans")}
                />
              )}
              </>
            )}
          </Suspense>
        </div>
      </main>
    </div>
  )
}

function Status({ tone = "info", children }) {
  const color = tone === "error" ? S.red : tone === "success" ? S.green : S.sub
  return (
    <div className="glass-card" style={{ border: `1px solid ${color}55`, background: `${color}12`, color, borderRadius: 8, padding: "11px 14px", fontSize: 12, marginBottom: 8 }}>
      {children}
    </div>
  )
}

function ShellMessage({ title, text, compact = false }) {
  return (
    <div style={{ minHeight: compact ? "auto" : "100vh", display: "grid", placeItems: "center", background: compact ? "transparent" : S.bg, color: S.text, fontFamily: FONT_BODY, padding: compact ? 0 : 20 }}>
      <Card style={{ textAlign: "center", width: "100%", maxWidth: 420 }}>
        <div style={{ fontSize: 18, fontWeight: 800, marginBottom: 6 }}>{title}</div>
        <div style={{ color: S.muted, fontSize: 13, marginBottom: compact ? 0 : 14 }}>{text}</div>
        {!compact && <button style={{ ...btnPrimary, opacity: 0.75, cursor: "default" }}>Lütfen bekleyin</button>}
      </Card>
    </div>
  )
}

function normalizeText(value) {
  return String(value || "")
    .trim()
    .toLocaleLowerCase("tr-TR")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
}

function parseAmount(value) {
  const raw = String(value || "")
    .replace(/[₺\s+]/g, "")
    .replace(/^-/, "")
  const cleaned = raw.includes(",")
    ? raw.replace(/\./g, "").replace(",", ".")
    : raw
  const amount = parseFloat(cleaned)
  return Number.isFinite(amount) && amount > 0 ? amount : 0
}

function parseDate(value) {
  const text = String(value || "").trim()
  if (/^\d{4}-\d{2}-\d{2}$/.test(text)) return text
  const match = text.match(/^(\d{1,2})[./-](\d{1,2})[./-](\d{4})$/)
  if (!match) return ""
  const [, day, month, year] = match
  return `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`
}

function parseCSV(text) {
  const rows = []
  let row = []
  let cell = ""
  let inQuotes = false
  const firstLine = text.split(/\r?\n/, 1)[0] || ""
  const delimiter = firstLine.includes(";") ? ";" : ","

  for (let index = 0; index < text.length; index += 1) {
    const char = text[index]
    const next = text[index + 1]
    if (char === '"' && inQuotes && next === '"') {
      cell += '"'
      index += 1
    } else if (char === '"') {
      inQuotes = !inQuotes
    } else if (char === delimiter && !inQuotes) {
      row.push(cell)
      cell = ""
    } else if ((char === "\n" || char === "\r") && !inQuotes) {
      if (char === "\r" && next === "\n") index += 1
      row.push(cell)
      rows.push(row)
      row = []
      cell = ""
    } else {
      cell += char
    }
  }

  if (cell || row.length) {
    row.push(cell)
    rows.push(row)
  }

  return rows
}

function readFileAsDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result)
    reader.onerror = () => reject(reader.error)
    reader.readAsDataURL(file)
  })
}

function formatCurrency(value) {
  return new Intl.NumberFormat("tr-TR", {
    style: "currency",
    currency: "TRY",
    minimumFractionDigits: 0,
  }).format(value)
}
