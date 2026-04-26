import Card from "../ui/Card"
import EmptyState from "../ui/EmptyState"
import FieldLabel from "../ui/FieldLabel"
import Modal from "../ui/Modal"
import {
  S,
  FONT_BODY,
  FONT_MONO,
  inputStyle,
  btnGhost,
  btnDanger,
  btnPrimary,
  PALETTE,
} from "../../constants/theme"
import { TRY } from "../../utils/helpers"

const CATEGORY_ICONS = [
  "🏠", "🛒", "☕", "🚗", "🎬", "💡", "📱", "🛡️",
  "💼", "💰", "🎯", "✈️", "🏥", "🎓", "🍽️", "🧾",
  "🧘", "🎁", "⭐", "📦", "🚌", "🏋️", "🎮", "🔧",
]

export default function Categories({
  cats,
  catSpend,
  showModal,
  editCat,
  catForm,
  setCatForm,
  onAdd,
  onEdit,
  onSave,
  onDelete,
  onClose,
}) {
  const CatCard = ({ c }) => (
    <Card style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <div
          style={{
            width: 42,
            height: 42,
            borderRadius: 11,
            background: c.color + "22",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
          }}
        >
          <div
            style={{
              color: c.color,
              fontWeight: 900,
              fontSize: 15,
            }}
          >
            {c.icon?.slice(0, 2) || "•"}
          </div>
        </div>
        <div style={{ flex: 1, overflow: "hidden" }}>
          <div
            style={{
              fontWeight: 700,
              fontSize: 14,
              color: S.text,
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          >
            {c.name}
            {c.isArchived && (
              <span style={{ color: S.muted, fontSize: 10, marginLeft: 6 }}>
                Pasif
              </span>
            )}
          </div>
          {!c.isIncome && c.budget > 0 ? (
            <div
              style={{ fontSize: 11, color: S.muted, fontFamily: FONT_MONO }}
            >
              Limit: {TRY(c.budget)}
            </div>
          ) : (
            <div style={{ fontSize: 11, color: S.muted }}>Limitsiz</div>
          )}
        </div>
      </div>
      <div style={{ display: "flex", gap: 6 }}>
        <button
          onClick={() => onEdit(c)}
          style={{
            ...btnGhost,
            padding: "5px 0",
            fontSize: 11,
            flex: 1,
            textAlign: "center",
          }}
        >
          Düzenle
        </button>
        <button
          onClick={() => onDelete(c.id)}
          style={{ ...btnDanger, flex: 1, textAlign: "center" }}
        >
          Pasifleştir
        </button>
      </div>
    </Card>
  )

  return (
    <div>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 10,
        }}
      >
        <div>
          <span
            style={{
              fontSize: 14,
              fontWeight: 600,
              color: S.text,
              fontFamily: FONT_BODY,
            }}
          >
            {cats.filter((c) => !c.isArchived).length} Aktif Kategori
          </span>
          <span
            style={{
              fontSize: 12,
              color: S.muted,
              marginLeft: 8,
              fontFamily: FONT_BODY,
            }}
          >
            {cats.filter((c) => c.isIncome && !c.isArchived).length} gelir ·{" "}
            {cats.filter((c) => !c.isIncome && !c.isArchived).length} gider
          </span>
        </div>
        <button onClick={onAdd} style={btnPrimary}>
          + Kategori Ekle
        </button>
      </div>
      <div style={{ marginBottom: 10 }}>
        <div
          style={{
            fontSize: 11,
            fontWeight: 700,
            letterSpacing: 0,
            textTransform: "uppercase",
            color: S.green,
            marginBottom: 8,
          }}
        >
          Gelir Kategorileri
        </div>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill,minmax(200px,1fr))",
            gap: 8,
          }}
        >
          {cats.filter((c) => c.isIncome && !c.isArchived).map((c) => (
            <CatCard key={c.id} c={c} />
          ))}
          {cats.filter((c) => c.isIncome && !c.isArchived).length === 0 && (
            <EmptyState icon="💰" title="Gelir kategorisi yok" text="Maaş, prim veya ek gelir gibi kaynaklar için kategori oluşturabilirsiniz." />
          )}
        </div>
      </div>
      <div>
        <div
          style={{
            fontSize: 11,
            fontWeight: 700,
            letterSpacing: 0,
            textTransform: "uppercase",
            color: S.red,
            marginBottom: 8,
          }}
        >
          Gider Kategorileri
        </div>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill,minmax(200px,1fr))",
            gap: 8,
          }}
        >
          {cats.filter((c) => !c.isIncome && !c.isArchived).map((c) => (
            <CatCard key={c.id} c={c} />
          ))}
          {cats.filter((c) => !c.isIncome && !c.isArchived).length === 0 && (
            <EmptyState icon="🧾" title="Gider kategorisi yok" text="Market, kira, ulaşım ve abonelikler için gider kategorileri oluşturun." />
          )}
        </div>
      </div>
      {showModal && (
        <Modal
          title={editCat ? "Kategoriyi Düzenle" : "Yeni Kategori"}
          onClose={onClose}
          onSave={onSave}
        >
          <div>
            <FieldLabel>Kategori Adı</FieldLabel>
            <input
              type="text"
              placeholder="Kategori adı..."
              value={catForm.name}
              onChange={(e) =>
                setCatForm((p) => ({ ...p, name: e.target.value }))
              }
              style={inputStyle}
            />
          </div>

          <div>
            <FieldLabel>İkon</FieldLabel>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(8, 1fr)", gap: 8 }}>
              {CATEGORY_ICONS.map((icon) => (
                <button
                  key={icon}
                  type="button"
                  onClick={() => setCatForm((p) => ({ ...p, icon }))}
                  style={{
                    height: 38,
                    borderRadius: 8,
                    border: `1px solid ${catForm.icon === icon ? S.green : S.border}`,
                    background: catForm.icon === icon ? "rgba(78,222,163,0.14)" : "rgba(255,255,255,0.04)",
                    cursor: "pointer",
                    fontSize: 18,
                  }}
                >
                  {icon}
                </button>
              ))}
            </div>
          </div>
          <div>
            <FieldLabel>Tür</FieldLabel>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: 8,
              }}
            >
              {[
                { v: false, l: "💸 Gider", c: S.red },
                { v: true,  l: "💰 Gelir", c: S.green },
              ].map(({ v, l, c }) => (
                <button
                  key={String(v)}
                  onClick={() => setCatForm((p) => ({ ...p, isIncome: v }))}
                  style={{
                    padding: "10px",
                    borderRadius: 9,
                    border: `1px solid ${
                      catForm.isIncome === v ? c : S.border
                    }`,
                    background:
                      catForm.isIncome === v ? c + "1a" : "transparent",
                    color: catForm.isIncome === v ? c : S.muted,
                    cursor: "pointer",
                    fontWeight: 700,
                    fontSize: 13,
                    fontFamily: FONT_BODY,
                  }}
                >
                  {l}
                </button>
              ))}
            </div>
          </div>
          <div>
            <FieldLabel>Renk</FieldLabel>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {PALETTE.map((col) => (
                <button
                  key={col}
                  onClick={() => setCatForm((p) => ({ ...p, color: col }))}
                  style={{
                    width: 30,
                    height: 30,
                    borderRadius: 8,
                    background: col,
                    padding: 0,
                    cursor: "pointer",
                    border: `2px solid ${
                      catForm.color === col
                        ? "rgba(255,255,255,0.9)"
                        : "transparent"
                    }`,
                    transform:
                      catForm.color === col ? "scale(1.2)" : "scale(1)",
                    transition: "all 0.15s",
                  }}
                />
              ))}
            </div>
          </div>
          {!catForm.isIncome && (
            <div>
              <FieldLabel>
                Aylık Bütçe Limiti (₺) — 0 = Limitsiz
              </FieldLabel>
              <input
                type="number"
                min="0"
                placeholder="0"
                value={catForm.budget}
                onChange={(e) =>
                  setCatForm((p) => ({ ...p, budget: e.target.value }))
                }
                style={inputStyle}
              />
            </div>
          )}
        </Modal>
      )}
    </div>
  )
}
