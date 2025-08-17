import React, { useState, useEffect, useContext, useCallback } from "react";
import { useHistory, useParams } from "react-router-dom";
import { SiOpenai } from "react-icons/si";
import typebotIcon from "../../assets/typebot-ico.png";
import { HiOutlinePuzzle } from "react-icons/hi";

import { toast } from "react-toastify";
import {
  Box,
  Paper,
  Button,
  Stack,
  Typography,
  SpeedDial,
  SpeedDialAction,
  SpeedDialIcon,
  CircularProgress,
  IconButton,
  Tooltip,
  useTheme,
  alpha,
  Chip,
} from "@mui/material";
import {
  AccessTime,
  CallSplit,
  DynamicFeed,
  LibraryBooks,
  RocketLaunch,
  FileDownload,
  FileUpload,
  Save,
  BallotOutlined as BallotIcon,
  ConfirmationNumber,
  ZoomIn,
  ZoomOut,
  CenterFocusStrong,
  GridOn,
  GridOff,
  WarningAmber,
} from "@mui/icons-material";

import ReactFlow, {
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
} from "react-flow-renderer";

import audioNode from "./nodes/audioNode";
import typebotNode from "./nodes/typebotNode";
import openaiNode from "./nodes/openaiNode";
import messageNode from "./nodes/messageNode.js";
import startNode from "./nodes/startNode";
import menuNode from "./nodes/menuNode";
import intervalNode from "./nodes/intervalNode";
import imgNode from "./nodes/imgNode";
import randomizerNode from "./nodes/randomizerNode";
import videoNode from "./nodes/videoNode";
import questionNode from "./nodes/questionNode";
import singleBlockNode from "./nodes/singleBlockNode";
import ticketNode from "./nodes/ticketNode";
import RemoveEdge from "./nodes/removeEdge";

import api from "../../services/api";
import toastError from "../../errors/toastError";
import { AuthContext } from "../../context/Auth/AuthContext";
import { useNodeStorage } from "../../stores/useNodeStorage";

import MainHeader from "../../components/MainHeader";
import Title from "../../components/Title";
import FlowBuilderAddTextModal from "../../components/FlowBuilderAddTextModal";
import FlowBuilderIntervalModal from "../../components/FlowBuilderIntervalModal";
import FlowBuilderConditionModal from "../../components/FlowBuilderConditionModal";
import FlowBuilderMenuModal from "../../components/FlowBuilderMenuModal";
import FlowBuilderAddImgModal from "../../components/FlowBuilderAddImgModal";
import FlowBuilderTicketModal from "../../components/FlowBuilderAddTicketModal";
import FlowBuilderAddAudioModal from "../../components/FlowBuilderAddAudioModal";
import FlowBuilderRandomizerModal from "../../components/FlowBuilderRandomizerModal";
import FlowBuilderAddVideoModal from "../../components/FlowBuilderAddVideoModal";
import FlowBuilderSingleBlockModal from "../../components/FlowBuilderSingleBlockModal";
import FlowBuilderTypebotModal from "../../components/FlowBuilderAddTypebotModal";
import FlowBuilderOpenAIModal from "../../components/FlowBuilderAddOpenAIModal";
import FlowBuilderAddQuestionModal from "../../components/FlowBuilderAddQuestionModal";

import "reactflow/dist/style.css";
import { colorPrimary } from "../../styles/styles";

// Função para gerar ID aleatório
function geraStringAleatoria(tamanho) {
  var stringAleatoria = "";
  var caracteres =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  for (var i = 0; i < tamanho; i++) {
    stringAleatoria += caracteres.charAt(
      Math.floor(Math.random() * caracteres.length)
    );
  }
  return stringAleatoria;
}

// Definição dos tipos de nós
const nodeTypes = {
  message: messageNode,
  start: startNode,
  menu: menuNode,
  interval: intervalNode,
  img: imgNode,
  audio: audioNode,
  randomizer: randomizerNode,
  video: videoNode,
  singleBlock: singleBlockNode,
  ticket: ticketNode,
  typebot: typebotNode,
  openai: openaiNode,
  question: questionNode,
};

// Definição dos tipos de conexões
const edgeTypes = {
  buttonedge: RemoveEdge,
};

// Nó inicial
const initialNodes = [
  {
    id: "1",
    position: { x: 250, y: 100 },
    data: { label: "Inicio do fluxo" },
    type: "start",
  },
];

const initialEdges = [];

export const FlowBuilderConfig = () => {
  const history = useHistory();
  const { id } = useParams();
  const storageItems = useNodeStorage();
  const { user } = useContext(AuthContext);
  const systemTheme = useTheme();
  const isDark = systemTheme.palette.mode === "dark";

  const [loading, setLoading] = useState(false);
  const [saveLoading, setSaveLoading] = useState(false);
  const [pageNumber, setPageNumber] = useState(1);
  const [dataNode, setDataNode] = useState(null);
  const [hasMore, setHasMore] = useState(false);
  const [modalAddText, setModalAddText] = useState(null);
  const [modalAddInterval, setModalAddInterval] = useState(false);
  const [modalAddMenu, setModalAddMenu] = useState(null);
  const [modalAddImg, setModalAddImg] = useState(null);
  const [modalAddAudio, setModalAddAudio] = useState(null);
  const [modalAddRandomizer, setModalAddRandomizer] = useState(null);
  const [modalAddVideo, setModalAddVideo] = useState(null);
  const [modalAddSingleBlock, setModalAddSingleBlock] = useState(null);
  const [modalAddTicket, setModalAddTicket] = useState(null);
  const [modalAddTypebot, setModalAddTypebot] = useState(null);
  const [modalAddOpenAI, setModalAddOpenAI] = useState(null);
  const [modalAddQuestion, setModalAddQuestion] = useState(null);
  const [showGrid, setShowGrid] = useState(true);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [nodeCount, setNodeCount] = useState(1);
  const [edgeCount, setEdgeCount] = useState(0);

  // Estilos de conexão
  const connectionLineStyle = {
    stroke: isDark ? "#6b6b6b" : "#2b2b2b",
    strokeWidth: "3px",
  };

  // Estados para os nós e conexões do fluxo
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  // Callback para conectar nós
  const onConnect = useCallback(
    (params) => {
      setEdges((eds) => addEdge(params, eds));
      setHasUnsavedChanges(true);
      setEdgeCount((prev) => prev + 1);
    },
    [setEdges]
  );

  // Função para adicionar um novo nó
  const addNode = (type, data) => {
    const posY = nodes[nodes.length - 1].position.y;
    const posX =
      nodes[nodes.length - 1].position.x + nodes[nodes.length - 1].width + 40;

    let newNode;

    switch (type) {
      case "start":
        newNode = {
          id: "1",
          position: { x: posX, y: posY },
          data: { label: "Inicio do fluxo" },
          type: "start",
        };
        setNodes([newNode]);
        break;
      case "text":
        newNode = {
          id: geraStringAleatoria(30),
          position: { x: posX, y: posY },
          data: { label: data.text },
          type: "message",
        };
        setNodes((old) => [...old, newNode]);
        break;
      case "interval":
        newNode = {
          id: geraStringAleatoria(30),
          position: { x: posX, y: posY },
          data: { label: `Intervalo ${data.sec} seg.`, sec: data.sec },
          type: "interval",
        };
        setNodes((old) => [...old, newNode]);
        break;
      case "menu":
        newNode = {
          id: geraStringAleatoria(30),
          position: { x: posX, y: posY },
          data: {
            message: data.message,
            arrayOption: data.arrayOption,
          },
          type: "menu",
        };
        setNodes((old) => [...old, newNode]);
        break;
      case "img":
        newNode = {
          id: geraStringAleatoria(30),
          position: { x: posX, y: posY },
          data: { url: data.url },
          type: "img",
        };
        setNodes((old) => [...old, newNode]);
        break;
      case "audio":
        newNode = {
          id: geraStringAleatoria(30),
          position: { x: posX, y: posY },
          data: { url: data.url, record: data.record },
          type: "audio",
        };
        setNodes((old) => [...old, newNode]);
        break;
      case "randomizer":
        newNode = {
          id: geraStringAleatoria(30),
          position: { x: posX, y: posY },
          data: { percent: data.percent },
          type: "randomizer",
        };
        setNodes((old) => [...old, newNode]);
        break;
      case "video":
        newNode = {
          id: geraStringAleatoria(30),
          position: { x: posX, y: posY },
          data: { url: data.url },
          type: "video",
        };
        setNodes((old) => [...old, newNode]);
        break;
      case "singleBlock":
        newNode = {
          id: geraStringAleatoria(30),
          position: { x: posX, y: posY },
          data: { ...data },
          type: "singleBlock",
        };
        setNodes((old) => [...old, newNode]);
        break;
      case "ticket":
        newNode = {
          id: geraStringAleatoria(30),
          position: { x: posX, y: posY },
          data: { ...data },
          type: "ticket",
        };
        setNodes((old) => [...old, newNode]);
        break;
      case "typebot":
        newNode = {
          id: geraStringAleatoria(30),
          position: { x: posX, y: posY },
          data: { ...data },
          type: "typebot",
        };
        setNodes((old) => [...old, newNode]);
        break;
      case "openai":
        newNode = {
          id: geraStringAleatoria(30),
          position: { x: posX, y: posY },
          data: { ...data },
          type: "openai",
        };
        setNodes((old) => [...old, newNode]);
        break;
      case "question":
        newNode = {
          id: geraStringAleatoria(30),
          position: { x: posX, y: posY },
          data: { ...data },
          type: "question",
        };
        setNodes((old) => [...old, newNode]);
        break;
      default:
        break;
    }

    setHasUnsavedChanges(true);
    setNodeCount((prev) => prev + 1);
  };

  // Funções handlers para cada tipo de nó
  const textAdd = (data) => addNode("text", data);
  const intervalAdd = (data) => addNode("interval", data);
  const conditionAdd = (data) => addNode("condition", data);
  const menuAdd = (data) => addNode("menu", data);
  const imgAdd = (data) => addNode("img", data);
  const audioAdd = (data) => addNode("audio", data);
  const randomizerAdd = (data) => addNode("randomizer", data);
  const videoAdd = (data) => addNode("video", data);
  const singleBlockAdd = (data) => addNode("singleBlock", data);
  const ticketAdd = (data) => addNode("ticket", data);
  const typebotAdd = (data) => addNode("typebot", data);
  const openaiAdd = (data) => addNode("openai", data);
  const questionAdd = (data) => addNode("question", data);

  // Carregar fluxo existente
  useEffect(() => {
    setLoading(true);
    const fetchFlow = async () => {
      try {
        const { data } = await api.get(`/flowbuilder/flow/${id}`);
        if (data.flow.flow !== null) {
          const flowNodes = data.flow.flow.nodes;
          setNodes(flowNodes);
          setEdges(data.flow.flow.connections);

          // Armazenar variáveis do fluxo
          const filterVariables = flowNodes.filter(
            (nd) => nd.type === "question"
          );
          const variables = filterVariables
            .map((variable) => variable.data.typebotIntegration?.answerKey)
            .filter(Boolean);

          localStorage.setItem("variables", JSON.stringify(variables));

          // Atualizar contadores
          setNodeCount(flowNodes.length);
          setEdgeCount(data.flow.flow.connections.length);
        }
        setLoading(false);
      } catch (err) {
        toastError(err);
        setLoading(false);
      }
    };
    fetchFlow();
  }, [id]);

  // Efeito para ação de nós (excluir, duplicar)
  useEffect(() => {
    if (storageItems.action === "delete") {
      setNodes((old) => old.filter((item) => item.id !== storageItems.node));
      setEdges((old) => {
        const newData = old.filter((item) => item.source !== storageItems.node);
        const newClearTarget = newData.filter(
          (item) => item.target !== storageItems.node
        );
        return newClearTarget;
      });
      storageItems.setNodesStorage("");
      storageItems.setAct("idle");
      setHasUnsavedChanges(true);
      setNodeCount((prev) => prev - 1);
      // Atualizar contagem de conexões
      setTimeout(() => {
        setEdgeCount(edges.length);
      }, 100);
    }
    if (storageItems.action === "duplicate") {
      const nodeDuplicate = nodes.filter(
        (item) => item.id === storageItems.node
      )[0];

      if (nodeDuplicate) {
        const maioresX = nodes.map((node) => node.position.x);
        const maiorX = Math.max(...maioresX);
        const finalY = nodes[nodes.length - 1].position.y;
        const nodeNew = {
          ...nodeDuplicate,
          id: geraStringAleatoria(30),
          position: {
            x: maiorX + 240,
            y: finalY,
          },
          selected: false,
          style: {
            borderColor: "transparent",
            borderWidth: 2,
            borderStyle: "solid",
            borderRadius: 8,
          },
        };
        setNodes((old) => [...old, nodeNew]);
        storageItems.setNodesStorage("");
        storageItems.setAct("idle");
        setHasUnsavedChanges(true);
        setNodeCount((prev) => prev + 1);
      }
    }
  }, [storageItems.action]);

  // Carregar mais fluxos
  const loadMore = () => {
    setPageNumber((prevState) => prevState + 1);
  };

  // Handler para scroll
  const handleScroll = (e) => {
    if (!hasMore || loading) return;
    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
    if (scrollHeight - (scrollTop + 100) < clientHeight) {
      loadMore();
    }
  };

  // Salvar fluxo
  const saveFlow = async () => {
    setSaveLoading(true);
    try {
      await api.post("/flowbuilder/flow", {
        idFlow: id,
        nodes: nodes,
        connections: edges,
      });
      toast.success("Fluxo salvo com sucesso");
      setHasUnsavedChanges(false);
    } catch (err) {
      toastError(err);
    } finally {
      setSaveLoading(false);
    }
  };

  // Double click em um nó
  const doubleClick = (event, node) => {
    setDataNode(node);
    switch (node.type) {
      case "message":
        setModalAddText("edit");
        break;
      case "interval":
        setModalAddInterval("edit");
        break;
      case "menu":
        setModalAddMenu("edit");
        break;
      case "img":
        setModalAddImg("edit");
        break;
      case "audio":
        setModalAddAudio("edit");
        break;
      case "randomizer":
        setModalAddRandomizer("edit");
        break;
      case "singleBlock":
        setModalAddSingleBlock("edit");
        break;
      case "ticket":
        setModalAddTicket("edit");
        break;
      case "typebot":
        setModalAddTypebot("edit");
        break;
      case "openai":
        setModalAddOpenAI("edit");
        break;
      case "question":
        setModalAddQuestion("edit");
        break;
      default:
        break;
    }
  };

  // Click em um nó
  const clickNode = (event, node) => {
    setNodes((old) =>
      old.map((item) => {
        if (item.id === node.id) {
          return {
            ...item,
            selected: true,
            style: {
              borderColor: colorPrimary(),
              borderWidth: 2,
              borderStyle: "solid",
              borderRadius: 8,
            },
          };
        }
        return {
          ...item,
          selected: false,
          style: {
            borderColor: "transparent",
            borderWidth: 2,
            borderStyle: "solid",
            borderRadius: 8,
          },
        };
      })
    );
  };

  // Click em uma conexão
  const clickEdge = (event, edge) => {
    setNodes((old) =>
      old.map((item) => {
        return {
          ...item,
          selected: false,
          style: {
            borderColor: "transparent",
            borderWidth: 2,
            borderStyle: "solid",
            borderRadius: 8,
          },
        };
      })
    );
  };

  // Atualizar nó
  const updateNode = (dataAlter) => {
    setNodes((old) =>
      old.map((itemNode) => {
        if (itemNode.id === dataAlter.id) {
          return dataAlter;
        }
        return itemNode;
      })
    );
    setModalAddText(null);
    setModalAddInterval(null);
    setModalAddMenu(null);
    setModalAddOpenAI(null);
    setModalAddTypebot(null);
    setModalAddQuestion(null);
    setModalAddImg(null);
    setModalAddAudio(null);
    setModalAddRandomizer(null);
    setModalAddVideo(null);
    setModalAddSingleBlock(null);
    setModalAddTicket(null);
    setHasUnsavedChanges(true);
  };

  // Ações disponíveis no SpeedDial
  const actions = [
    {
      icon: <RocketLaunch style={{ color: "#3ABA38" }} />,
      name: "Inicio",
      type: "start",
      color: "#3ABA38",
    },
    {
      icon: <LibraryBooks style={{ color: "#EC5858" }} />,
      name: "Conteúdo",
      type: "content",
      color: "#EC5858",
    },
    {
      icon: <DynamicFeed style={{ color: "#683AC8" }} />,
      name: "Menu",
      type: "menu",
      color: "#683AC8",
    },
    {
      icon: <CallSplit style={{ color: "#1FBADC" }} />,
      name: "Randomizador",
      type: "random",
      color: "#1FBADC",
    },
    {
      icon: <AccessTime style={{ color: "#F7953B" }} />,
      name: "Intervalo",
      type: "interval",
      color: "#F7953B",
    },
    {
      icon: <ConfirmationNumber style={{ color: "#F7953B" }} />,
      name: "Ticket",
      type: "ticket",
      color: "#F7953B",
    },
    {
      icon: (
        <Box
          component="img"
          sx={{
            width: 24,
            height: 24,
          }}
          src={typebotIcon}
          alt="icon"
        />
      ),
      name: "TypeBot",
      type: "typebot",
      color: "#3ABA38",
    },
    {
      icon: <SiOpenai style={{ fontSize: 20, color: "#F7953B" }} />,
      name: "OpenAI",
      type: "openai",
      color: "#F7953B",
    },
    {
      icon: <BallotIcon style={{ color: "#F7953B" }} />,
      name: "Pergunta",
      type: "question",
      color: "#F7953B",
    },
  ];

  // Handlers para ações do SpeedDial
  const clickActions = (type) => {
    switch (type) {
      case "start":
        addNode("start");
        break;
      case "menu":
        setModalAddMenu("create");
        break;
      case "content":
        setModalAddSingleBlock("create");
        break;
      case "random":
        setModalAddRandomizer("create");
        break;
      case "interval":
        setModalAddInterval("create");
        break;
      case "ticket":
        setModalAddTicket("create");
        break;
      case "typebot":
        setModalAddTypebot("create");
        break;
      case "openai":
        setModalAddOpenAI("create");
        break;
      case "question":
        setModalAddQuestion("create");
        break;
      default:
        break;
    }
  };

  // Exportar fluxo
  const handleExportFlow = async () => {
    try {
      const flowData = {
        nodes,
        edges,
      };

      const blob = new Blob([JSON.stringify(flowData, null, 2)], {
        type: "application/json",
      });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `flow-${id}.json`);
      document.body.appendChild(link);
      link.click();
      link.remove();

      toast.success("Fluxo exportado com sucesso!");
    } catch (err) {
      toastError(err);
    }
  };

  // Importar fluxo
  const handleImportFlow = async (file) => {
    try {
      const reader = new FileReader();
      reader.onload = async (e) => {
        const flowData = JSON.parse(e.target.result);
        setNodes(flowData.nodes);
        setEdges(flowData.edges);
        toast.success("Fluxo importado com sucesso!");
        setHasUnsavedChanges(true);
        setNodeCount(flowData.nodes.length);
        setEdgeCount(flowData.edges.length);
      };
      reader.readAsText(file);
    } catch (err) {
      toastError(err);
    }
  };

  // Componente principal
  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        height: "100vh",
        bgcolor: isDark ? alpha("#151718", 0.95) : "#F8F9FA",
      }}
    >
      {/* Modais */}
      <FlowBuilderAddTextModal
        open={modalAddText}
        onSave={textAdd}
        data={dataNode}
        onUpdate={updateNode}
        close={setModalAddText}
      />
      <FlowBuilderIntervalModal
        open={modalAddInterval}
        onSave={intervalAdd}
        data={dataNode}
        onUpdate={updateNode}
        close={setModalAddInterval}
      />
      <FlowBuilderMenuModal
        open={modalAddMenu}
        onSave={menuAdd}
        data={dataNode}
        onUpdate={updateNode}
        close={setModalAddMenu}
      />
      <FlowBuilderAddImgModal
        open={modalAddImg}
        onSave={imgAdd}
        data={dataNode}
        onUpdate={updateNode}
        close={setModalAddImg}
      />
      <FlowBuilderAddAudioModal
        open={modalAddAudio}
        onSave={audioAdd}
        data={dataNode}
        onUpdate={updateNode}
        close={setModalAddAudio}
      />
      <FlowBuilderRandomizerModal
        open={modalAddRandomizer}
        onSave={randomizerAdd}
        data={dataNode}
        onUpdate={updateNode}
        close={setModalAddRandomizer}
      />
      <FlowBuilderAddVideoModal
        open={modalAddVideo}
        onSave={videoAdd}
        data={dataNode}
        onUpdate={updateNode}
        close={setModalAddVideo}
      />
      <FlowBuilderSingleBlockModal
        open={modalAddSingleBlock}
        onSave={singleBlockAdd}
        data={dataNode}
        onUpdate={updateNode}
        close={setModalAddSingleBlock}
      />
      <FlowBuilderTicketModal
        open={modalAddTicket}
        onSave={ticketAdd}
        data={dataNode}
        onUpdate={updateNode}
        close={setModalAddTicket}
      />
      <FlowBuilderTypebotModal
        open={modalAddTypebot}
        onSave={typebotAdd}
        data={dataNode}
        onUpdate={updateNode}
        close={setModalAddTypebot}
      />
      <FlowBuilderOpenAIModal
        open={modalAddOpenAI}
        onSave={openaiAdd}
        data={dataNode}
        onUpdate={updateNode}
        close={setModalAddOpenAI}
      />
      <FlowBuilderAddQuestionModal
        open={modalAddQuestion}
        onSave={questionAdd}
        data={dataNode}
        onUpdate={updateNode}
        close={setModalAddQuestion}
      />

      {/* Cabeçalho */}
      <MainHeader>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            width: "100%",
            alignItems: "center",
          }}
        >
          <Title>Desenhe seu fluxo</Title>
          <Box sx={{ display: "flex", gap: 1 }}>
            {hasUnsavedChanges && (
              <Chip
                icon={<WarningAmber sx={{ fontSize: 16 }} />}
                label="Não salvo"
                size="small"
                sx={{
                  bgcolor: alpha("#ff9800", isDark ? 0.2 : 0.1),
                  color: "#ff9800",
                  fontWeight: 500,
                  borderRadius: "6px",
                }}
              />
            )}
            <Chip
              label={`Nós: ${nodeCount}`}
              size="small"
              sx={{
                bgcolor: isDark ? alpha("#2196f3", 0.2) : alpha("#2196f3", 0.1),
                color: "#2196f3",
                fontWeight: 500,
                borderRadius: "6px",
              }}
            />
            <Chip
              label={`Conexões: ${edgeCount}`}
              size="small"
              sx={{
                bgcolor: isDark ? alpha("#9c27b0", 0.2) : alpha("#9c27b0", 0.1),
                color: "#9c27b0",
                fontWeight: 500,
                borderRadius: "6px",
              }}
            />
          </Box>
        </Box>
      </MainHeader>

      {/* Conteúdo principal */}
      {loading ? (
        <Stack justifyContent="center" alignItems="center" height="70vh">
          <CircularProgress sx={{ color: colorPrimary() }} />
        </Stack>
      ) : (
        <Paper
          sx={{
            flex: 1,
            position: "relative",
            bgcolor: isDark ? alpha("#1E2021", 0.8) : "#F8F9FA",
            border: isDark ? `1px solid ${alpha("#FFFFFF", 0.1)}` : "none",
            borderRadius: "8px",
            margin: "12px",
            boxShadow: isDark
              ? "0 4px 20px rgba(0,0,0,0.2)"
              : "0 4px 20px rgba(0,0,0,0.05)",
            overflow: "hidden",
          }}
          onScroll={handleScroll}
        >
          {/* Aviso para salvar */}
          <Box
            sx={{
              position: "absolute",
              top: "12px",
              left: "50%",
              transform: "translateX(-50%)",
              zIndex: 10,
              bgcolor: isDark ? alpha("#1E2021", 0.9) : alpha("#FFFFFF", 0.9),
              borderRadius: "8px",
              py: 1,
              px: 2,
              display: "flex",
              alignItems: "center",
              gap: 1,
              boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
              backdropFilter: "blur(8px)",
              border: isDark
                ? `1px solid ${alpha("#FFFFFF", 0.1)}`
                : "1px solid rgba(0,0,0,0.05)",
            }}
          >
            <Typography
              color={isDark ? "rgba(255,255,255,0.8)" : "rgba(0,0,0,0.7)"}
              fontWeight={500}
            >
              Não se esqueça de salvar seu fluxo!
            </Typography>
          </Box>

          {/* Menu de ações rápidas */}
          <SpeedDial
            ariaLabel="Menu de ações"
            sx={{
              position: "absolute",
              top: 16,
              left: 16,
              zIndex: 1000,
              "& .MuiFab-primary": {
                bgcolor: colorPrimary(),
                "&:hover": {
                  bgcolor: alpha(colorPrimary(), 0.9),
                },
                boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
              },
            }}
            icon={<SpeedDialIcon />}
            direction={"down"}
          >
            {actions.map((action) => (
              <SpeedDialAction
                key={action.name}
                icon={action.icon}
                tooltipTitle={
                  <Typography sx={{ px: 1, py: 0.5, fontWeight: 500 }}>
                    {action.name}
                  </Typography>
                }
                tooltipOpen
                tooltipPlacement={"right"}
                sx={{
                  bgcolor: isDark ? alpha("#1E2021", 0.95) : "#FFFFFF",
                  "&:hover": {
                    bgcolor: isDark
                      ? alpha("#1E2021", 0.8)
                      : alpha("#F5F5F5", 0.8),
                  },
                  boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                }}
                onClick={() => clickActions(action.type)}
                FabProps={{
                  sx: {
                    bgcolor: isDark ? alpha("#1E2021", 0.95) : "#FFFFFF",
                    "&:hover": {
                      bgcolor: isDark
                        ? alpha("#1E2021", 0.8)
                        : alpha("#F5F5F5", 0.8),
                    },
                    boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                  },
                }}
              />
            ))}
          </SpeedDial>

          {/* Botões de ação */}
          <Stack
            direction={"row"}
            justifyContent={"flex-end"}
            spacing={1}
            sx={{
              position: "absolute",
              top: 12,
              right: 12,
              zIndex: 10,
            }}
          >
            <input
              type="file"
              id="import-flow-builder"
              accept=".json"
              style={{ display: "none" }}
              onChange={(e) => {
                if (e.target.files?.length) {
                  handleImportFlow(e.target.files[0]);
                  e.target.value = "";
                }
              }}
            />
            <Button
              variant="contained"
              color="primary"
              onClick={() =>
                document.getElementById("import-flow-builder").click()
              }
              startIcon={<FileUpload />}
              sx={{
                textTransform: "none",
                fontWeight: 500,
                borderRadius: "8px",
                bgcolor: isDark
                  ? alpha("#2196f3", 0.15)
                  : alpha("#2196f3", 0.1),
                color: "#2196f3",
                boxShadow: "none",
                px: 2,
                "&:hover": {
                  bgcolor: isDark
                    ? alpha("#2196f3", 0.25)
                    : alpha("#2196f3", 0.2),
                  boxShadow: "0 4px 8px rgba(0,0,0,0.1)",
                },
              }}
            >
              Importar
            </Button>
            <Button
              variant="contained"
              color="primary"
              onClick={handleExportFlow}
              startIcon={<FileDownload />}
              sx={{
                textTransform: "none",
                fontWeight: 500,
                borderRadius: "8px",
                bgcolor: isDark
                  ? alpha("#9c27b0", 0.15)
                  : alpha("#9c27b0", 0.1),
                color: "#9c27b0",
                boxShadow: "none",
                px: 2,
                "&:hover": {
                  bgcolor: isDark
                    ? alpha("#9c27b0", 0.25)
                    : alpha("#9c27b0", 0.2),
                  boxShadow: "0 4px 8px rgba(0,0,0,0.1)",
                },
              }}
            >
              Exportar
            </Button>
            <Button
              variant="contained"
              color="primary"
              onClick={saveFlow}
              startIcon={<Save />}
              disabled={saveLoading}
              sx={{
                textTransform: "none",
                fontWeight: 500,
                borderRadius: "8px",
                bgcolor: hasUnsavedChanges
                  ? colorPrimary()
                  : isDark
                  ? alpha(colorPrimary(), 0.15)
                  : alpha(colorPrimary(), 0.1),
                color: hasUnsavedChanges ? "#FFF" : colorPrimary(),
                boxShadow: hasUnsavedChanges
                  ? "0 4px 8px rgba(0,0,0,0.15)"
                  : "none",
                px: 2,
                "&:hover": {
                  bgcolor: hasUnsavedChanges
                    ? alpha(colorPrimary(), 0.9)
                    : isDark
                    ? alpha(colorPrimary(), 0.25)
                    : alpha(colorPrimary(), 0.2),
                  boxShadow: "0 4px 8px rgba(0,0,0,0.1)",
                },
              }}
            >
              {saveLoading ? "Salvando..." : "Salvar"}
            </Button>
          </Stack>

          {/* Área do fluxo */}
          <Box
            sx={{
              width: "100%",
              height: "100%",
              position: "relative",
            }}
          >
            <ReactFlow
              nodes={nodes}
              edges={edges}
              deleteKeyCode={["Backspace", "Delete"]}
              onNodesChange={onNodesChange}
              onEdgesChange={onEdgesChange}
              onNodeDoubleClick={doubleClick}
              onNodeClick={clickNode}
              onEdgeClick={clickEdge}
              onConnect={onConnect}
              nodeTypes={nodeTypes}
              fitView
              connectionLineStyle={connectionLineStyle}
              style={{
                backgroundColor: isDark ? alpha("#151718", 0.95) : "#F8F9FA",
              }}
              edgeTypes={edgeTypes}
              defaultEdgeOptions={{
                style: {
                  stroke: isDark ? "#6b6b6b" : "#2b2b2b",
                  strokeWidth: "2px",
                },
                animated: true,
                type: "buttonedge",
              }}
            >
              {/* Minimap personalizado */}
              <MiniMap
                nodeStrokeColor={(n) => {
                  if (n.selected) return colorPrimary();
                  return isDark ? "#444" : "#ddd";
                }}
                nodeColor={(n) => {
                  if (n.type === "start") return "#3ABA38";
                  if (n.type === "message") return "#EC5858";
                  if (n.type === "menu") return "#683AC8";
                  if (n.type === "interval") return "#F7953B";
                  if (n.type === "randomizer") return "#1FBADC";
                  return isDark ? "#333" : "#eee";
                }}
                nodeBorderRadius={8}
                style={{
                  backgroundColor: isDark
                    ? alpha("#1E2021", 0.8)
                    : alpha("#FFFFFF", 0.8),
                  border: isDark
                    ? `1px solid ${alpha("#FFFFFF", 0.1)}`
                    : "1px solid rgba(0,0,0,0.05)",
                  borderRadius: "8px",
                  right: 12,
                  bottom: 12,
                  boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                }}
              />

              {/* Controles personalizados */}
              <Controls
                style={{
                  backgroundColor: isDark
                    ? alpha("#1E2021", 0.8)
                    : alpha("#FFFFFF", 0.8),
                  border: isDark
                    ? `1px solid ${alpha("#FFFFFF", 0.1)}`
                    : "1px solid rgba(0,0,0,0.05)",
                  borderRadius: "8px",
                  left: 12,
                  bottom: 12,
                  boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                  button: {
                    backgroundColor: isDark
                      ? alpha("#1E2021", 0.8)
                      : alpha("#FFFFFF", 0.8),
                    color: isDark ? "#FFFFFF" : "#333333",
                    borderRadius: "6px",
                    border: "none",
                    "&:hover": {
                      backgroundColor: isDark
                        ? alpha("#333", 0.8)
                        : alpha("#F5F5F5", 0.8),
                    },
                  },
                }}
              />

              {/* Background com grid */}
              <Background
                variant={showGrid ? "dots" : "none"}
                gap={12}
                size={1}
                color={isDark ? "#333" : "#eee"}
              />

              {/* Grid Control */}
              <Box
                sx={{
                  position: "absolute",
                  top: 70,
                  right: 20,
                  zIndex: 10,
                  bgcolor: isDark
                    ? alpha("#1E2021", 0.8)
                    : alpha("#FFFFFF", 0.8),
                  boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                  borderRadius: "8px",
                  border: isDark
                    ? `1px solid ${alpha("#FFFFFF", 0.1)}`
                    : "1px solid rgba(0,0,0,0.05)",
                  overflow: "hidden",
                }}
              >
                <IconButton
                  onClick={() => setShowGrid(!showGrid)}
                  sx={{
                    borderRadius: "8px",
                    color: isDark ? "#FFFFFF" : "#333333",
                    "&:hover": {
                      bgcolor: isDark
                        ? alpha("#333", 0.8)
                        : alpha("#F5F5F5", 0.8),
                    },
                  }}
                >
                  {showGrid ? <GridOff /> : <GridOn />}
                </IconButton>
              </Box>
            </ReactFlow>
          </Box>
        </Paper>
      )}

      {/* Estilos CSS globais */}
      <style jsx global>{`
        .react-flow__node {
          transition: all 0.2s ease;
        }

        .react-flow__node.selected,
        .react-flow__node:focus {
          box-shadow: 0 0 0 2px ${colorPrimary()};
        }

        .react-flow__edge {
          transition: stroke 0.2s ease;
        }

        .react-flow__edge.selected .react-flow__edge-path,
        .react-flow__edge:focus .react-flow__edge-path {
          stroke: ${colorPrimary()} !important;
          stroke-width: 3px !important;
        }

        .react-flow__handle {
          background-color: ${colorPrimary()};
          width: 8px;
          height: 8px;
          border-radius: 50%;
          border: none;
        }

        .react-flow__attribution {
          display: none;
        }

        .react-flow__minimap {
          border-radius: 8px;
          overflow: hidden;
        }

        .react-flow__panel {
          border-radius: 8px;
          overflow: hidden;
          transition: all 0.3s ease;
        }

        .react-flow__controls button {
          border-radius: 6px;
          margin: 2px 0;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s ease;
        }

        .react-flow__controls button svg {
          fill: ${isDark ? "#FFFFFF" : "#333333"};
        }

        .react-flow__controls button:hover {
          background-color: ${isDark
            ? alpha("#333", 0.8)
            : alpha("#F5F5F5", 0.8)};
        }

        .react-flow__node-default,
        .react-flow__node-input,
        .react-flow__node-output {
          border-radius: 8px;
          box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
          padding: 10px 15px;
          transition: all 0.3s ease;
        }

        .react-flow__node:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 12px rgba(0, 0, 0, 0.15);
        }
      `}</style>
    </Box>
  );
};

export default FlowBuilderConfig;
