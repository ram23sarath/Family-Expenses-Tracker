"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Table, TBody, Td, Th, THead, Tr } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/toast";
import type { ColumnMapping, ImportPreview, ImportValidationIssue, ParsedCsvRow } from "@/lib/imports/types";

interface ImportWizardProps {
  accounts: Array<{ id: string; name: string; provider_type: string }>;
}

export const ImportWizard = ({ accounts }: ImportWizardProps) => {
  const { pushToast } = useToast();
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [file, setFile] = useState<File | null>(null);
  const [accountId, setAccountId] = useState(accounts[0]?.id ?? "");
  const [providerType, setProviderType] = useState(accounts[0]?.provider_type ?? "indmoney_csv");
  const [defaultCurrency, setDefaultCurrency] = useState("INR");
  const [mappingOverride, setMappingOverride] = useState("");
  const [uploadId, setUploadId] = useState<string | null>(null);
  const [importJobId, setImportJobId] = useState<string | null>(null);
  const [preview, setPreview] = useState<ImportPreview | null>(null);
  const [loading, setLoading] = useState(false);

  const upload = async () => {
    if (!file || !accountId) return;
    setLoading(true);
    const formData = new FormData();
    formData.append("file", file);
    formData.append("accountId", accountId);
    formData.append("providerType", providerType);
    const response = await fetch("/api/import/upload", {
      method: "POST",
      body: formData
    });
    setLoading(false);
    if (!response.ok) {
      const payload = await response.json();
      pushToast(payload.error ?? "Upload failed", "error");
      return;
    }
    const payload = await response.json();
    setUploadId(payload.upload.id);
    pushToast("CSV uploaded", "success");
    setStep(2);
  };

  const parse = async () => {
    if (!uploadId) return;
    setLoading(true);
    let customMapping: Partial<ColumnMapping> | undefined = undefined;
    if (mappingOverride.trim()) {
      try {
        customMapping = JSON.parse(mappingOverride) as Partial<ColumnMapping>;
      } catch {
        pushToast("Invalid mapping override JSON", "error");
        setLoading(false);
        return;
      }
    }
    const response = await fetch("/api/import/parse", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        uploadId,
        parserOptions: {
          defaultCurrency,
          customMapping
        }
      })
    });
    setLoading(false);
    if (!response.ok) {
      const payload = await response.json();
      pushToast(payload.error ?? "Parse failed", "error");
      return;
    }
    const payload = await response.json();
    setImportJobId(payload.job.id);
    setPreview(payload.preview);
    pushToast("CSV parsed and validated", "success");
    setStep(3);
  };

  const commit = async () => {
    if (!importJobId) return;
    setLoading(true);
    const response = await fetch("/api/import/commit", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ importJobId })
    });
    setLoading(false);
    if (!response.ok) {
      const payload = await response.json();
      pushToast(payload.error ?? "Commit failed", "error");
      return;
    }
    const payload = await response.json();
    pushToast(`Import committed (${payload.committedRows} rows)`, "success");
    setStep(1);
    setFile(null);
    setUploadId(null);
    setImportJobId(null);
    setPreview(null);
  };

  return (
    <div className="space-y-4">
      <div className="card">
        <p className="text-sm font-semibold text-slate-500">Import flow</p>
        <div className="mt-3 flex flex-wrap items-center gap-2 text-sm">
          <Badge className={step === 1 ? "bg-blue-100 text-blue-700" : ""}>1. Upload CSV</Badge>
          <Badge className={step === 2 ? "bg-blue-100 text-blue-700" : ""}>2. Parse + preview</Badge>
          <Badge className={step === 3 ? "bg-blue-100 text-blue-700" : ""}>3. Confirm + save</Badge>
        </div>
      </div>

      {step === 1 && (
        <div className="card space-y-3">
          <Select
            value={accountId}
            onChange={(event) => {
              const id = event.target.value;
              setAccountId(id);
              const account = accounts.find((item) => item.id === id);
              if (account) setProviderType(account.provider_type);
            }}
          >
            {accounts.map((account) => (
              <option value={account.id} key={account.id}>
                {account.name} ({account.provider_type})
              </option>
            ))}
          </Select>
          <Select value={providerType} onChange={(event) => setProviderType(event.target.value)}>
            <option value="indmoney_csv">INDmoney CSV</option>
            <option value="zerodha">Zerodha export</option>
            <option value="groww">Groww export</option>
            <option value="manual">Manual format</option>
          </Select>
          <Input type="file" accept=".csv,text/csv" onChange={(event) => setFile(event.target.files?.[0] ?? null)} />
          <Button onClick={upload} disabled={loading || !file || !accountId}>
            {loading ? "Uploading..." : "Upload CSV"}
          </Button>
        </div>
      )}

      {step === 2 && (
        <div className="card space-y-3">
          <p className="text-sm text-slate-600">Review parser output before committing.</p>
          <Input value={defaultCurrency} onChange={(event) => setDefaultCurrency(event.target.value.toUpperCase())} placeholder="Default currency (INR/USD)" />
          <textarea
            className="min-h-28 w-full rounded-lg border border-slate-300 p-2 text-sm"
            placeholder='Optional mapping override JSON, e.g. {"symbol":["Ticker"]}'
            value={mappingOverride}
            onChange={(event) => setMappingOverride(event.target.value)}
          />
          <Button onClick={parse} disabled={loading}>
            {loading ? "Parsing..." : "Parse and preview"}
          </Button>
        </div>
      )}

      {step === 3 && preview && (
        <div className="space-y-4">
          <div className="card">
            <p className="text-sm">
              Valid rows: <strong>{preview.validRows}</strong> / {preview.totalRows}
            </p>
            {preview.issues?.length > 0 && (
              <div className="mt-3 space-y-2">
                {preview.issues.slice(0, 15).map((issue: ImportValidationIssue) => (
                  <p key={`${issue.rowNumber}-${issue.message}`} className={issue.severity === "error" ? "text-sm text-red-600" : "text-sm text-amber-600"}>
                    Row {issue.rowNumber}: {issue.message}
                  </p>
                ))}
              </div>
            )}
          </div>
          <div className="card overflow-hidden p-0">
            <div className="max-h-80 overflow-auto">
              <Table>
                <THead>
                  <Tr>
                    <Th>Row</Th>
                    <Th>Account</Th>
                    <Th>Symbol</Th>
                    <Th>Quantity</Th>
                    <Th>Amount</Th>
                    <Th>Date</Th>
                    <Th>Status</Th>
                  </Tr>
                </THead>
                <TBody>
                  {preview.rows.slice(0, 100).map((row: ParsedCsvRow) => {
                    const hasError = preview.issues.some((issue: ImportValidationIssue) => issue.rowNumber === row.rowNumber && issue.severity === "error");
                    const hasWarning = preview.issues.some((issue: ImportValidationIssue) => issue.rowNumber === row.rowNumber && issue.severity === "warning");
                    return (
                      <Tr key={row.rowNumber}>
                        <Td>{row.rowNumber}</Td>
                        <Td>{row.accountName}</Td>
                        <Td>{row.symbol || "-"}</Td>
                        <Td>{row.quantity ?? "-"}</Td>
                        <Td>{row.amount ?? "-"}</Td>
                        <Td>{row.transactionDate || "-"}</Td>
                        <Td>
                          {hasError ? (
                            <Badge className="bg-red-100 text-red-700">Error</Badge>
                          ) : hasWarning ? (
                            <Badge className="bg-amber-100 text-amber-700">Warning</Badge>
                          ) : (
                            <Badge className="bg-emerald-100 text-emerald-700">Valid</Badge>
                          )}
                        </Td>
                      </Tr>
                    );
                  })}
                </TBody>
              </Table>
            </div>
          </div>
          <Button onClick={commit} disabled={loading}>
            {loading ? "Saving..." : "Confirm and save"}
          </Button>
        </div>
      )}
    </div>
  );
};
