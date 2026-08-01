import { useEffect, useRef, useState } from "react";
import {
  supabase,
  AKIRA_PHOTOS_BUCKET,
  RAFFLE_ID,
} from "../lib/supabase";
import type { AkiraContent } from "../lib/types";
import { SketchBox } from "./SketchBox";

interface AkiraSectionProps {
  content: AkiraContent | null;
  isAdmin: boolean;
  onChanged: () => void;
}

export function AkiraSection({
  content,
  isAdmin,
  onChanged,
}: AkiraSectionProps) {
  const [editing, setEditing] = useState(false);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [photos, setPhotos] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (content) {
      setTitle(content.title);
      setBody(content.body);
      setPhotos(content.photos ?? []);
    }
  }, [content]);

  if (!content) return null;

  const startEdit = () => {
    setError(null);
    setTitle(content.title);
    setBody(content.body);
    setPhotos(content.photos ?? []);
    setEditing(true);
  };

  const cancel = () => {
    setEditing(false);
    setError(null);
  };

  const save = async () => {
    setSaving(true);
    setError(null);
    const { error: updErr } = await supabase
      .from("akira_content")
      .update({ title: title.trim(), body: body.trim(), photos })
      .eq("id", RAFFLE_ID);
    if (updErr) {
      setError("No se pudo guardar. " + updErr.message);
    } else {
      setEditing(false);
      onChanged();
    }
    setSaving(false);
  };

  const handleUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setUploading(true);
    setError(null);
    const uploaded: string[] = [];
    for (const file of Array.from(files)) {
      const ext = file.name.split(".").pop() ?? "jpg";
      // Unique path without Date/Math.random: use performance time + index.
      const key = `${RAFFLE_ID}/${Math.floor(
        performance.now() * 1000
      )}-${uploaded.length}.${ext}`;
      const { error: upErr } = await supabase.storage
        .from(AKIRA_PHOTOS_BUCKET)
        .upload(key, file, {
          cacheControl: "3600",
          upsert: false,
          contentType: file.type || "image/jpeg",
        });
      if (upErr) {
        setError("Error al subir una foto. " + upErr.message);
        continue;
      }
      const { data } = supabase.storage
        .from(AKIRA_PHOTOS_BUCKET)
        .getPublicUrl(key);
      uploaded.push(data.publicUrl);
    }
    if (uploaded.length > 0) setPhotos((prev) => [...prev, ...uploaded]);
    if (fileRef.current) fileRef.current.value = "";
    setUploading(false);
  };

  const removePhoto = (url: string) => {
    setPhotos((prev) => prev.filter((p) => p !== url));
  };

  return (
    <SketchBox className="paper" fill="#eae2f5" seed={51} washi>
      {!editing ? (
        <>
          <div className="row" style={{ justifyContent: "space-between" }}>
            <h2 className="section-title">{content.title}</h2>
            {isAdmin && (
              <button className="btn secondary" onClick={startEdit}>
                Editar seccion
              </button>
            )}
          </div>
          <div className="akira" style={{ marginTop: 12 }}>
            <div className="akira-body">{content.body}</div>
            <div className="photo-grid">
              {content.photos.length === 0 ? (
                <div className="photo-empty">
                  Pronto agregaremos fotos de Akira aqui.
                </div>
              ) : (
                content.photos.map((url) => (
                  <img
                    key={url}
                    src={url}
                    alt="Foto de Akira"
                    loading="lazy"
                  />
                ))
              )}
            </div>
          </div>
        </>
      ) : (
        <>
          <h2 className="section-title">Editar seccion de Akira</h2>
          {error && <div className="notice err">{error}</div>}
          <div className="field">
            <label htmlFor="akira-title">Titulo</label>
            <input
              id="akira-title"
              className="input"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              maxLength={80}
            />
          </div>
          <div className="field">
            <label htmlFor="akira-body">Texto</label>
            <textarea
              id="akira-body"
              className="textarea"
              value={body}
              onChange={(e) => setBody(e.target.value)}
            />
          </div>
          <div className="field">
            <label>Fotos</label>
            <div className="photo-grid">
              {photos.map((url) => (
                <div className="thumb-editable" key={url}>
                  <img src={url} alt="Foto de Akira" />
                  <button
                    type="button"
                    className="thumb-del"
                    onClick={() => removePhoto(url)}
                    aria-label="Quitar foto"
                  >
                    x
                  </button>
                </div>
              ))}
            </div>
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              multiple
              style={{ marginTop: 12 }}
              onChange={(e) => handleUpload(e.target.files)}
              disabled={uploading}
            />
            {uploading && (
              <div className="notice info">Subiendo fotos...</div>
            )}
          </div>
          <div className="row">
            <button
              className="btn"
              onClick={save}
              disabled={saving || uploading}
            >
              {saving ? "Guardando..." : "Guardar cambios"}
            </button>
            <button className="btn ghost" onClick={cancel} disabled={saving}>
              Cancelar
            </button>
          </div>
        </>
      )}
    </SketchBox>
  );
}
