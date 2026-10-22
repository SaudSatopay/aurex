"use client";

import { useQueryClient } from "@tanstack/react-query";
import {
  BotIcon,
  LoaderCircleIcon,
  MessageSquarePlusIcon,
  MessagesSquareIcon,
  SendHorizontalIcon,
  ShieldCheckIcon,
  Trash2Icon,
} from "lucide-react";
import { AnimatePresence, motion, type Variants } from "motion/react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useId, useRef, useState } from "react";
import { toast } from "sonner";

import { MintMark } from "@/components/art/ornaments";
import { StatusBadge } from "@/components/app/badges";
import { FormError } from "@/components/app/form";
import { NoteList, PageHeader, Panel } from "@/components/app/page";
import { useSession } from "@/components/app/session-provider";
import { Notice, SkeletonBlock } from "@/components/app/states";
import { RevealGroup, RevealItem } from "@/components/motion/reveal";
import { QueryError, toastError } from "@/components/app/decision-lab/common";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Textarea } from "@/components/ui/textarea";
import { orgQueryKey, useInvalidateOrg, useOrgMutation, useOrgQuery } from "@/hooks/use-org-query";
import { errorText } from "@/lib/app/decision-lab-format";
import type { AdvisorCapabilities, AdvisorMessage, AskResponse, Conversation, ConversationSummary } from "@/lib/app/advisor-types";
import { formatNumber, formatRelative, humanize } from "@/lib/app/format";
import { cn } from "@/lib/utils";

import { AssistantAnswer, CHIP_CLASS } from "./answer";

const MAX = 2000;

const EASE_OUT = [0.23, 1, 0.32, 1] as const;

/** Messages rise into the thread on a critically damped spring, sharpening as they arrive. */
const BUBBLE: Variants = {
  hidden: { opacity: 0, y: 14, scale: 0.985, filter: "blur(8px)" },
  shown: {
    opacity: 1,
    y: 0,
    scale: 1,
    filter: "blur(0px)",
    transitionEnd: { filter: "none" },
    transition: {
      y: { type: "spring", bounce: 0, visualDuration: 0.55 },
      scale: { type: "spring", bounce: 0, visualDuration: 0.55 },
      opacity: { duration: 0.4, ease: EASE_OUT },
      filter: { duration: 0.45, ease: EASE_OUT },
    },
  },
  exit: { opacity: 0, y: 6, filter: "blur(4px)", transition: { duration: 0.16, ease: EASE_OUT } },
};


function ConversationList({
  conversations,
  activeId,
  onSelect,
  onNew,
  onDelete,
  loading,
  error,
  onRetry,
}: {
  conversations: ConversationSummary[];
  activeId: string | null;
  onSelect: (id: string) => void;
  onNew: () => void;
  onDelete: (c: ConversationSummary) => void;
  loading: boolean;
  error: unknown;
  onRetry: () => void;
}) {
  return (
    <div className="space-y-3">
      <Button className="w-full" variant="outline" onClick={onNew}>
        <MessageSquarePlusIcon aria-hidden />
        New conversation
      </Button>
      {loading ? (
        <div className="space-y-2">
          <SkeletonBlock className="h-10" />
          <SkeletonBlock className="h-10" />
          <SkeletonBlock className="h-10" />
        </div>
      ) : error ? (
        <QueryError compact error={error} onRetry={onRetry} />
      ) : conversations.length === 0 ? (
        <p className="px-1 text-sm text-muted-foreground">Your conversations appear here.</p>
      ) : (
        <ul className="space-y-1" aria-label="Conversations">
          {conversations.map((c) => (
            <li key={c.id} className="group/conv relative">
              <button
                type="button"
                onClick={() => onSelect(c.id)}
                aria-current={c.id === activeId ? "true" : undefined}
                className={cn(
                  "press w-full rounded-xl py-2 pr-9 pl-3 text-left outline-none hover:bg-white/55 focus-visible:ring-3 focus-visible:ring-ring/50 dark:hover:bg-white/[0.05]",
                  c.id === activeId &&
                    "bg-white/70 shadow-[inset_0_1px_0_var(--glass-edge),0_0_0_1px_var(--glass-border),0_6px_16px_-10px_oklch(0.19_0.05_263/0.3)] hover:bg-white/70 dark:bg-white/[0.08] dark:hover:bg-white/[0.08]",
                )}
              >
                <span className="line-clamp-2 text-[0.8125rem] font-medium">{c.title}</span>
                <span className="block text-xs text-muted-foreground">{formatRelative(c.updated_at)}</span>
              </button>
              <Button
                variant="ghost"
                size="icon-xs"
                className="absolute top-2 right-1.5 opacity-60 transition-opacity duration-200 group-hover/conv:opacity-100 focus-visible:opacity-100"
                onClick={() => onDelete(c)}
                aria-label={`Delete conversation: ${c.title}`}
              >
                <Trash2Icon aria-hidden />
              </Button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

/** The question, on glassine: a frosted slip laid over the page, its writing in ink. */
function UserBubble({ text }: { text: string }) {
  return (
    <div className="flex justify-end">
      <p className="max-w-[min(42rem,90%)] rounded-xl rounded-br-sm glass-strong px-4 py-2.5 text-[0.9375rem] leading-relaxed whitespace-pre-wrap text-ink">
        <span className="sr-only">You asked: </span>
        {text}
      </p>
    </div>
  );
}

function Welcome({ capabilities, onAsk, busy }: { capabilities?: AdvisorCapabilities; onAsk: (q: string) => void; busy: boolean }) {
  return (
    <RevealGroup onMount stagger={0.06} className="space-y-6">
      <RevealItem y={12}>
      <Panel>
        <div className="flex flex-col items-start gap-4 sm:flex-row">
          <MintMark name="advisor" className="size-14 shrink-0" />
          <div className="min-w-0 space-y-3">
            <div>
              <h2 className="font-heading text-base font-semibold">Ask about your business</h2>
              <p className="mt-1 max-w-[68ch] text-sm leading-relaxed text-muted-foreground">
                Answers are built from the same validated calculations as the rest of AUREX. Every figure is checked against the tool output it came from, and anything that can&apos;t be traced is flagged.
              </p>
            </div>
            {capabilities?.examples.length ? (
              <div className="flex flex-wrap gap-2" aria-label="Example questions">
                {capabilities.examples.map((q) => (
                  <Button key={q} variant="outline" size="sm" className={CHIP_CLASS} onClick={() => onAsk(q)} disabled={busy}>
                    {q}
                  </Button>
                ))}
              </div>
            ) : null}
          </div>
        </div>
      </Panel>
      </RevealItem>
      {capabilities ? (
        <RevealItem y={12} className="grid gap-6 lg:grid-cols-2">
          <Panel title="What the advisor guarantees">
            <ul className="space-y-2.5 text-sm">
              {capabilities.guarantees.map((g) => (
                <li key={g} className="flex items-start gap-2.5">
                  <ShieldCheckIcon className="mt-0.5 size-4 shrink-0 text-verdigris" aria-hidden />
                  <span>{g}</span>
                </li>
              ))}
            </ul>
          </Panel>
          <Panel title="Tools it can use" description="Each runs with your permissions and store scope">
            <ul className="max-h-72 divide-y divide-(--glass-border) overflow-y-auto pr-1 text-[0.8125rem]">
              {capabilities.tools.map((t) => (
                <li key={t.name} className="py-2 first:pt-0 last:pb-0">
                  <p className="flex items-baseline gap-2 font-medium">
                    {humanize(t.name)}
                    <span className="font-mono text-[0.6875rem] font-normal text-muted-foreground">{t.name}</span>
                  </p>
                  <p className="text-xs leading-relaxed text-muted-foreground">{t.description}</p>
                </li>
              ))}
            </ul>
          </Panel>
        </RevealItem>
      ) : null}
    </RevealGroup>
  );
}

export function AdvisorView() {
  const { orgId } = useSession();
  const params = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const queryClient = useQueryClient();
  const invalidate = useInvalidateOrg();
  const activeId = params.get("c");
  const composerId = useId();
  const endRef = useRef<HTMLDivElement>(null);
  /** The question just sent: its bubble is already on screen, so it doesn't rise in a second time. */
  const [justSent, setJustSent] = useState<string | null>(null);
  const [text, setText] = useState("");
  const [pending, setPending] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<ConversationSummary | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);

  const setActive = useCallback(
    (id: string | null) => {
      const next = new URLSearchParams(params.toString());
      if (id) next.set("c", id);
      else next.delete("c");
      const qs = next.toString();
      router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
    },
    [params, pathname, router],
  );

  const capabilities = useOrgQuery<AdvisorCapabilities>("/advisor/capabilities", { staleTime: 30 * 60_000 });
  const conversations = useOrgQuery<{ conversations: ConversationSummary[] }>("/advisor/conversations", { staleTime: 30_000 });
  const conversation = useOrgQuery<Conversation>(activeId ? `/advisor/conversations/${activeId}` : null, { staleTime: 60_000 });
  const ask = useOrgMutation<{ question: string; conversation_id?: string }, AskResponse>((body, call) => call("/advisor/ask", { json: body }));
  const remove = useOrgMutation<string, void>((id, call) => call(`/advisor/conversations/${id}`, { method: "DELETE" }));

  const messages: AdvisorMessage[] = conversation.data?.messages ?? [];
  const busy = ask.isPending;

  useEffect(() => {
    if (pending || messages.length) endRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [pending, messages.length]);

  function submit(question: string) {
    const q = question.trim();
    if (!q || busy) return;
    if (q.length > MAX) {
      toast.error(`Questions are limited to ${formatNumber(MAX)} characters.`);
      return;
    }
    setPending(q);
    ask.mutate(
      { question: q, conversation_id: activeId ?? undefined },
      {
        onSuccess: (res) => {
          const key = orgQueryKey(orgId, `/advisor/conversations/${res.conversation_id}`, undefined);
          const userMessage: AdvisorMessage = {
            id: `local-${Date.now()}`,
            role: "user",
            content: q,
            answer: null,
            mode: null,
            tool_calls: null,
            created_at: new Date().toISOString(),
          };
          queryClient.setQueryData<Conversation>(key, (old) =>
            old
              ? { ...old, messages: [...old.messages, userMessage, res.message] }
              : { id: res.conversation_id, title: q.slice(0, 120), messages: [userMessage, res.message] },
          );
          setJustSent(q);
          setText("");
          setPending(null);
          if (res.conversation_id !== activeId) setActive(res.conversation_id);
          void invalidate("/advisor/conversations");
        },
        onError: (error) => {
          setPending(null);
          toastError(error, "The advisor couldn't answer");
        },
      },
    );
  }

  const capabilityData = capabilities.data;
  const deterministic = capabilityData?.mode === "deterministic";
  const list = conversations.data?.conversations ?? [];
  const listProps = {
    conversations: list,
    activeId,
    onSelect: (id: string) => {
      setActive(id);
      setSheetOpen(false);
    },
    onNew: () => {
      setActive(null);
      setSheetOpen(false);
      ask.reset();
    },
    onDelete: (c: ConversationSummary) => setDeleteTarget(c),
    loading: conversations.isPending,
    error: conversations.error,
    onRetry: () => void conversations.refetch(),
  };

  return (
    <>
      <PageHeader
        title="AI Advisor"
        description="Ask questions in plain language. Answers come with the figures they rest on, each traced to a validated calculation, plus evidence, assumptions and limitations."
        meta={
          capabilityData ? (
            <>
              <StatusBadge tone={deterministic ? "neutral" : "info"} icon={BotIcon}>
                {deterministic ? "Deterministic mode" : `Model: ${capabilityData.model ?? "language model"}`}
              </StatusBadge>
              <span>{formatNumber(capabilityData.tools.length)} tools available to your role</span>
            </>
          ) : null
        }
        actions={
          <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
            <SheetTrigger asChild>
              <Button variant="outline" className="lg:hidden">
                <MessagesSquareIcon aria-hidden />
                Conversations {list.length ? `(${list.length})` : ""}
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[86%] max-w-[20rem] gap-0 p-4">
              <SheetHeader className="px-0 pt-0">
                <SheetTitle>Conversations</SheetTitle>
              </SheetHeader>
              <ConversationList {...listProps} />
            </SheetContent>
          </Sheet>
        }
      />

      {deterministic ? (
        <Notice className="mb-6" title="Deterministic analysis mode">
          No language model is configured, so each question is matched to a validated analysis (sales changes, store profit, staffing scenarios,
          stockout risk, pricing, saved scenarios, forecasts and more). Free-form questions outside those analyses need a configured model; an
          administrator can set one up.
        </Notice>
      ) : null}

      <div className="grid items-start gap-6 lg:grid-cols-[16rem_minmax(0,1fr)]">
        <aside className="sticky top-20 hidden max-h-[calc(100dvh-6.5rem)] overflow-y-auto pr-1 lg:block" aria-label="Conversations">
          <ConversationList {...listProps} />
        </aside>

        <section className="min-w-0 space-y-5" aria-label="Conversation">
          {capabilities.error ? <QueryError error={capabilities.error} onRetry={() => void capabilities.refetch()} /> : null}
          {activeId && conversation.isPending ? (
            <div className="space-y-4" aria-busy="true">
              <SkeletonBlock className="ml-auto h-12 w-2/3" />
              <SkeletonBlock className="h-64 w-full" />
            </div>
          ) : activeId && conversation.error ? (
            <Panel>
              <QueryError error={conversation.error} onRetry={() => void conversation.refetch()} />
            </Panel>
          ) : messages.length === 0 && !pending ? (
            <Welcome capabilities={capabilityData} onAsk={submit} busy={busy} />
          ) : (
            <ol className="space-y-5" aria-label="Messages">
              <AnimatePresence initial={false}>
                {messages.map((m) => (
                  <motion.li
                    key={m.id}
                    data-reveal=""
                    variants={BUBBLE}
                    initial={m.role === "user" && m.content === justSent ? false : "hidden"}
                    animate="shown"
                  >
                    {m.role === "user" ? (
                      <UserBubble text={m.content} />
                    ) : (
                      <AssistantAnswer message={m} onFollowUp={submit} busy={busy} />
                    )}
                  </motion.li>
                ))}
                {pending ? (
                  <motion.li
                    key="__pending"
                    className="space-y-5"
                    data-reveal=""
                    variants={BUBBLE}
                    initial="hidden"
                    animate="shown"
                  >
                    <UserBubble text={pending} />
                    <div
                      className="flex w-fit max-w-full items-center gap-2.5 rounded-2xl rounded-tl-md glass px-4 py-3.5 text-sm text-muted-foreground"
                      role="status"
                    >
                      <LoaderCircleIcon className="size-4 animate-spin text-primary" aria-hidden />
                      Running validated analyses with your permissions…
                      <span aria-hidden className="flex gap-1 motion-reduce:hidden">
                        {[0, 1, 2].map((i) => (
                          <span key={i} className="size-1 animate-pulse rounded-full bg-primary/60" style={{ animationDelay: `${i * 180}ms` }} />
                        ))}
                      </span>
                    </div>
                  </motion.li>
                ) : null}
              </AnimatePresence>
            </ol>
          )}
          <div ref={endRef} />

          <form
            className="sticky bottom-3 z-10 pt-2"
            onSubmit={(event) => {
              event.preventDefault();
              submit(text);
            }}
          >
            <div className="rounded-2xl glass-strong p-2 outline-2 outline-offset-0 outline-transparent transition-[outline-color] duration-200 focus-within:outline-ring/60">
              <Label htmlFor={composerId} className="sr-only">
                Ask the advisor
              </Label>
              <Textarea
                id={composerId}
                value={text}
                onChange={(e) => setText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) {
                    e.preventDefault();
                    submit(text);
                  }
                }}
                rows={2}
                maxLength={MAX}
                placeholder="Ask about sales, stores, staffing, stock, prices or scenarios…"
                className="min-h-14 resize-none border-0 bg-transparent px-2 text-[0.9375rem] shadow-none focus-visible:ring-0 dark:bg-transparent"
                aria-describedby={`${composerId}-hint`}
                disabled={busy}
              />
              <div className="flex items-center justify-between gap-2 px-1">
                <p id={`${composerId}-hint`} className="text-xs text-muted-foreground">
                  Enter to send, Shift+Enter for a new line · {formatNumber(text.length)}/{formatNumber(MAX)}
                </p>
                <Button type="submit" size="sm" className="rounded-xl" disabled={busy || !text.trim()}>
                  {busy ? <LoaderCircleIcon className="animate-spin" aria-hidden /> : <SendHorizontalIcon aria-hidden />}
                  Ask
                </Button>
              </div>
            </div>
            <FormError message={ask.error && !busy ? errorText(ask.error) : null} />
          </form>
          {capabilityData && messages.length ? (
            <NoteList className="text-xs" notes={["Tools run with your permissions; figures your role cannot see are never used.", ...capabilityData.guarantees.slice(0, 1)]} />
          ) : null}
        </section>
      </div>

      <AlertDialog open={Boolean(deleteTarget)} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this conversation?</AlertDialogTitle>
            <AlertDialogDescription>
              “{deleteTarget?.title}” and its answers are permanently removed for you. This cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={remove.isPending}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              disabled={remove.isPending}
              onClick={(event) => {
                event.preventDefault();
                if (!deleteTarget) return;
                const target = deleteTarget;
                remove.mutate(target.id, {
                  onSuccess: () => {
                    setDeleteTarget(null);
                    if (target.id === activeId) setActive(null);
                    void invalidate("/advisor/conversations");
                    toast.success("Conversation deleted");
                  },
                  onError: (error) => toastError(error, "The conversation wasn't deleted"),
                });
              }}
            >
              {remove.isPending ? "Deleting…" : "Delete conversation"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
