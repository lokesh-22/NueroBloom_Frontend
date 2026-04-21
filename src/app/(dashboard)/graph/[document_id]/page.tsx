'use client';

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import {
  Background,
  Controls,
  Edge,
  MiniMap,
  Node,
  Panel,
  ReactFlow,
  ReactFlowProvider,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";

import {
  getDocumentById,
  getKnowledgeGraph,
  type DocumentRecord,
  type KnowledgeGraphResponse,
} from "@/services/api";

function buildFlowGraph(graph: KnowledgeGraphResponse) {
  const topicNodes = graph.nodes.filter((node) => node.type === "Topic");
  const conceptNodes = graph.nodes.filter((node) => node.type === "Concept");
  const belongsEdges = graph.edges.filter((edge) => edge.type === "BELONGS_TO");

  const conceptGroups = new Map<string, string[]>();
  belongsEdges.forEach((edge) => {
    const list = conceptGroups.get(edge.target) || [];
    list.push(edge.source);
    conceptGroups.set(edge.target, list);
  });

  const orphanConcepts = conceptNodes
    .filter((node) => !belongsEdges.some((edge) => edge.source === node.id))
    .map((node) => node.id);

  const positionedNodes: Node[] = [];

  topicNodes.forEach((topic, topicIndex) => {
    positionedNodes.push({
      id: topic.id,
      data: { label: topic.label },
      position: { x: 60, y: 80 + topicIndex * 210 },
      style: {
        background: "#d7e8ff",
        border: "1px solid #6b9fff",
        color: "#123b75",
        borderRadius: 18,
        width: 190,
        padding: 12,
        fontWeight: 700,
      },
    });

    const groupedConcepts = conceptGroups.get(topic.id) || [];
    groupedConcepts.forEach((conceptId, conceptIndex) => {
      const concept = conceptNodes.find((node) => node.id === conceptId);
      if (!concept) return;

      positionedNodes.push({
        id: concept.id,
        data: { label: concept.label },
        position: {
          x: 360 + (conceptIndex % 2) * 240,
          y: 60 + topicIndex * 210 + Math.floor(conceptIndex / 2) * 90,
        },
        style: {
          background: "#dbf3df",
          border: "1px solid #67b576",
          color: "#134920",
          borderRadius: 18,
          width: 210,
          padding: 12,
          fontWeight: 600,
        },
      });
    });
  });

  orphanConcepts.forEach((conceptId, index) => {
    const concept = conceptNodes.find((node) => node.id === conceptId);
    if (!concept) return;
    positionedNodes.push({
      id: concept.id,
      data: { label: concept.label },
      position: {
        x: 360 + (index % 2) * 240,
        y: 100 + (topicNodes.length + Math.floor(index / 2)) * 140,
      },
      style: {
        background: "#dbf3df",
        border: "1px solid #67b576",
        color: "#134920",
        borderRadius: 18,
        width: 210,
        padding: 12,
        fontWeight: 600,
      },
    });
  });

  const positionedEdges: Edge[] = graph.edges.map((edge, index) => ({
    id: `${edge.source}-${edge.target}-${edge.type}-${index}`,
    source: edge.source,
    target: edge.target,
    label: edge.type.replaceAll("_", " "),
    animated: edge.type === "RELATED_TO",
    style: edge.type === "RELATED_TO"
      ? { strokeDasharray: "6 4", stroke: "#5d7c7a" }
      : edge.type === "PREREQUISITE_FOR"
        ? { stroke: "#ba6b2a", strokeWidth: 1.8 }
        : { stroke: "#6b9fff" },
    markerEnd: edge.type === "PREREQUISITE_FOR"
      ? { type: "arrowclosed", color: "#ba6b2a" }
      : undefined,
  }));

  return {
    nodes: positionedNodes,
    edges: positionedEdges,
  };
}

function GraphCanvas() {
  const { document_id } = useParams();
  const [document, setDocument] = useState<DocumentRecord | null>(null);
  const [graph, setGraph] = useState<KnowledgeGraphResponse>({ nodes: [], edges: [] });
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [authToken] = useState(() => {
    if (typeof window === "undefined") return null;
    return window.localStorage.getItem("token");
  });
  const [error, setError] = useState(() => (
    authToken ? "" : "Your session has expired. Please sign in again."
  ));
  const [loading, setLoading] = useState(() => Boolean(authToken));

  useEffect(() => {
    if (!document_id || !authToken) return;

    Promise.all([
      getDocumentById(document_id as string),
      getKnowledgeGraph(document_id as string),
    ])
      .then(([doc, graphData]) => {
        setDocument(doc);
        setGraph(graphData);
        setSelectedNodeId(graphData.nodes[0]?.id || null);
      })
      .catch((err: Error) => setError(err.message))
      .finally(() => setLoading(false));
  }, [authToken, document_id]);

  const flowGraph = useMemo(() => buildFlowGraph(graph), [graph]);
  const selectedNode = useMemo(
    () => graph.nodes.find((node) => node.id === selectedNodeId) || null,
    [graph.nodes, selectedNodeId]
  );
  const relatedConcepts = useMemo(() => {
    if (!selectedNode) return [];

    if (selectedNode.type === "Topic") {
      return graph.edges
        .filter((edge) => edge.type === "BELONGS_TO" && edge.target === selectedNode.id)
        .map((edge) => graph.nodes.find((node) => node.id === edge.source))
        .filter(Boolean);
    }

    return graph.edges
      .filter((edge) => edge.source === selectedNode.id || edge.target === selectedNode.id)
      .map((edge) => {
        const nodeId = edge.source === selectedNode.id ? edge.target : edge.source;
        return graph.nodes.find((node) => node.id === nodeId);
      })
      .filter((node) => node?.type === "Concept")
      .filter(Boolean);
  }, [graph.edges, graph.nodes, selectedNode]);

  return (
    <div className="mx-auto max-w-[1500px] space-y-6">
      <section className="grid gap-5 xl:grid-cols-[minmax(0,1.1fr)_minmax(320px,0.9fr)]">
        <div className="relative overflow-hidden rounded-[30px] bg-[#163433] p-7 text-white">
          <div className="pointer-events-none absolute -right-10 top-0 h-32 w-32 rounded-full bg-white/10" />
          <p className="text-xs uppercase tracking-[0.28em] text-white/62">
            Knowledge graph
          </p>
          <h1 className="mt-3 text-4xl font-semibold text-balance">
            Explore how concepts connect across the document.
          </h1>
          <p className="mt-4 max-w-2xl text-sm leading-8 text-white/74">
            Topics cluster the big ideas. Concepts show the building blocks. Relationships help you trace prerequisites and related ideas.
          </p>
        </div>

        <div className="glass-card rounded-[30px] p-6">
          <p className="text-sm font-semibold text-[var(--text-soft)]">Active document</p>
          <p className="mt-3 text-2xl font-semibold text-[var(--text)]">
            {document?.title || "Loading document..."}
          </p>
          <p className="mt-3 text-sm leading-7 text-[var(--text-soft)]">
            Click any node to inspect it, jump to AI chat, or go straight into quiz practice.
          </p>
        </div>
      </section>

      {error && (
        <div className="rounded-[26px] bg-[rgba(178,75,75,0.08)] px-5 py-4 text-sm text-[var(--danger)]">
          {error}
        </div>
      )}

      <section className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_360px]">
        <div className="glass-card-strong h-[72vh] overflow-hidden rounded-[30px] p-4">
          {loading ? (
            <div className="flex h-full items-center justify-center text-sm text-[var(--text-soft)]">
              Building your graph view...
            </div>
          ) : graph.nodes.length === 0 ? (
            <div className="flex h-full items-center justify-center text-center text-sm leading-7 text-[var(--text-soft)]">
              No graph data is available for this document yet.
            </div>
          ) : (
            <ReactFlow
              nodes={flowGraph.nodes}
              edges={flowGraph.edges}
              fitView
              onNodeClick={(_, node) => setSelectedNodeId(node.id)}
            >
              <MiniMap
                pannable
                zoomable
                nodeColor={(node) => String(node.style?.background || "#d7e8ff")}
              />
              <Controls />
              <Background gap={18} size={1} color="rgba(17, 33, 31, 0.08)" />
              <Panel position="top-left" className="rounded-[18px] bg-white/92 px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-[var(--text-soft)] shadow">
                Zoom, pan, and inspect nodes
              </Panel>
            </ReactFlow>
          )}
        </div>

        <aside className="rounded-[30px] border border-[var(--line)] bg-white/78 p-6">
          <p className="text-xs uppercase tracking-[0.28em] text-[var(--text-soft)]">
            Inspector
          </p>

          {!selectedNode ? (
            <p className="mt-4 text-sm leading-7 text-[var(--text-soft)]">
              Select a node in the graph to inspect its meaning and connected ideas.
            </p>
          ) : (
            <div className="mt-4 space-y-4">
              <div className={`rounded-[22px] px-4 py-4 ${
                selectedNode.type === "Topic"
                  ? "bg-[#d7e8ff] text-[#123b75]"
                  : "bg-[#dbf3df] text-[#134920]"
              }`}>
                <p className="text-xs uppercase tracking-[0.2em] opacity-70">
                  {selectedNode.type}
                </p>
                <h2 className="mt-2 text-2xl font-semibold">
                  {selectedNode.label}
                </h2>
              </div>

              {selectedNode.type === "Concept" && (
                <>
                  <div className="rounded-[22px] bg-[var(--bg)] p-4">
                    <p className="text-sm font-semibold text-[var(--text)]">Description</p>
                    <p className="mt-2 text-sm leading-7 text-[var(--text-soft)]">
                      {selectedNode.description || "No description available for this concept yet."}
                    </p>
                  </div>
                  <div className="rounded-[22px] bg-[var(--bg)] p-4">
                    <p className="text-sm font-semibold text-[var(--text)]">Related concepts</p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {relatedConcepts.length > 0 ? relatedConcepts.map((item) => (
                        <button
                          key={item!.id}
                          type="button"
                          onClick={() => setSelectedNodeId(item!.id)}
                          className="rounded-full bg-white px-3 py-2 text-xs font-semibold text-[var(--text)] transition hover:text-[var(--accent)]"
                        >
                          {item!.label}
                        </button>
                      )) : (
                        <p className="text-sm leading-7 text-[var(--text-soft)]">
                          No connected concepts found.
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-3">
                    <Link
                      href={`/chat/${document_id}`}
                      className="rounded-[18px] bg-[var(--accent)] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[var(--accent-strong)]"
                    >
                      Ask AI
                    </Link>
                    <Link
                      href={`/quiz/${document_id}`}
                      className="rounded-[18px] border border-[var(--line)] bg-white px-4 py-3 text-sm font-semibold text-[var(--text)] transition hover:border-[var(--accent)] hover:text-[var(--accent)]"
                    >
                      Start quiz
                    </Link>
                  </div>
                </>
              )}

              {selectedNode.type === "Topic" && (
                <div className="rounded-[22px] bg-[var(--bg)] p-4">
                  <p className="text-sm font-semibold text-[var(--text)]">Concepts under this topic</p>
                  <div className="mt-3 space-y-2">
                    {relatedConcepts.length > 0 ? relatedConcepts.map((item) => (
                      <button
                        key={item!.id}
                        type="button"
                        onClick={() => setSelectedNodeId(item!.id)}
                        className="block w-full rounded-[18px] bg-white px-4 py-3 text-left text-sm font-medium text-[var(--text)] transition hover:text-[var(--accent)]"
                      >
                        {item!.label}
                      </button>
                    )) : (
                      <p className="text-sm leading-7 text-[var(--text-soft)]">
                        No concepts are attached to this topic yet.
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </aside>
      </section>
    </div>
  );
}

export default function KnowledgeGraphPage() {
  return (
    <ReactFlowProvider>
      <GraphCanvas />
    </ReactFlowProvider>
  );
}
