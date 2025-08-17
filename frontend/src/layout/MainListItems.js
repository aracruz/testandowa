import React, { useContext, useEffect, useReducer, useState } from "react";
import { Link as RouterLink, useLocation } from "react-router-dom";
import { useTheme, alpha } from "@mui/material/styles";
import useHelps from "../hooks/useHelps";
import {
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
  Badge,
  Collapse,
  List,
  Tooltip,
  Typography,
  Box,
  Chip,
} from "@mui/material";

// Import icons from Material UI
import {
  DashboardOutlined,
  WhatsApp,
  SyncAlt,
  SettingsOutlined,
  PeopleAltOutlined,
  ContactPhoneOutlined,
  AccountTreeOutlined,
  FlashOn,
  HelpOutline,
  CodeRounded,
  Schedule,
  LocalOffer,
  EventAvailable,
  ExpandLess,
  ExpandMore,
  People,
  ListAlt,
  Announcement,
  Forum,
  LocalAtm,
  Business,
  AllInclusiveRounded,
  AttachFileRounded,
  DescriptionRounded,
  DeviceHubRounded,
  GridOnRounded,
  PhonelinkSetupRounded,
} from "@mui/icons-material";
import {
  ViewKanban,
  Campaign,
  WebhookRounded,
  ShapeLineRounded,
} from "@mui/icons-material";

import { WhatsAppsContext } from "../context/WhatsApp/WhatsAppsContext";
import { AuthContext } from "../context/Auth/AuthContext";
import { useActiveMenu } from "../context/ActiveMenuContext";
import { Can } from "../components/Can";
import { isArray } from "lodash";
import api from "../services/api";
import toastError from "../errors/toastError";
import usePlans from "../hooks/usePlans";
import useVersion from "../hooks/useVersion";
import { i18n } from "../translate/i18n";
import moment from "moment";

// Paleta de cores modernas com gradientes
const iconStyles = {
  dashboard: {
    color: "#6366f1",
    gradient: "linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)",
  },
  tickets: {
    color: "#10b981",
    gradient: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
  },
  messages: {
    color: "#f59e0b",
    gradient: "linear-gradient(135deg, #f59e0b 0%, #f97316 100%)",
  },
  kanban: {
    color: "#8b5cf6",
    gradient: "linear-gradient(135deg, #8b5cf6 0%, #a855f7 100%)",
  },
  contacts: {
    color: "#06b6d4",
    gradient: "linear-gradient(135deg, #06b6d4 0%, #0891b2 100%)",
  },
  schedules: {
    color: "#ec4899",
    gradient: "linear-gradient(135deg, #ec4899 0%, #be185d 100%)",
  },
  tags: {
    color: "#14b8a6",
    gradient: "linear-gradient(135deg, #14b8a6 0%, #0d9488 100%)",
  },
  chats: {
    color: "#f97316",
    gradient: "linear-gradient(135deg, #f97316 0%, #ea580c 100%)",
  },
  helps: {
    color: "#3b82f6",
    gradient: "linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)",
  },
  campaigns: {
    color: "#ef4444",
    gradient: "linear-gradient(135deg, #ef4444 0%, #dc2626 100%)",
  },
  flowbuilder: {
    color: "#84cc16",
    gradient: "linear-gradient(135deg, #84cc16 0%, #65a30d 100%)",
  },
  announcements: {
    color: "#f59e0b",
    gradient: "linear-gradient(135deg, #f59e0b 0%, #d97706 100%)",
  },
  api: {
    color: "#06b6d4",
    gradient: "linear-gradient(135deg, #06b6d4 0%, #0891b2 100%)",
  },
  users: {
    color: "#8b5cf6",
    gradient: "linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)",
  },
  queues: {
    color: "#10b981",
    gradient: "linear-gradient(135deg, #10b981 0%, #047857 100%)",
  },
  prompts: {
    color: "#ec4899",
    gradient: "linear-gradient(135deg, #ec4899 0%, #db2777 100%)",
  },
  integrations: {
    color: "#f97316",
    gradient: "linear-gradient(135deg, #f97316 0%, #c2410c 100%)",
  },
  connections: {
    color: "#64748b",
    gradient: "linear-gradient(135deg, #64748b 0%, #475569 100%)",
  },
  files: {
    color: "#14b8a6",
    gradient: "linear-gradient(135deg, #14b8a6 0%, #0f766e 100%)",
  },
  financial: {
    color: "#10b981",
    gradient: "linear-gradient(135deg, #10b981 0%, #065f46 100%)",
  },
  settings: {
    color: "#6366f1",
    gradient: "linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)",
  },
  companies: {
    color: "#3b82f6",
    gradient: "linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)",
  },
};

function ListItemLink(props) {
  const { icon, primary, to, tooltip, showBadge, iconKey, small } = props;
  const theme = useTheme();
  const { activeMenu } = useActiveMenu();
  const location = useLocation();
  const isActive = activeMenu === to || location.pathname === to;

  const renderLink = React.useMemo(
    () =>
      React.forwardRef((itemProps, ref) => (
        <RouterLink to={to} ref={ref} {...itemProps} />
      )),
    [to]
  );

  const ConditionalTooltip = ({ children, tooltipEnabled }) =>
    tooltipEnabled ? (
      <Tooltip title={primary} placement="right">
        {children}
      </Tooltip>
    ) : (
      children
    );

  const iconStyle = iconStyles[iconKey] || iconStyles.dashboard;

  return (
    <ConditionalTooltip tooltipEnabled={!!tooltip}>
      <li>
        <ListItem
          button
          component={renderLink}
          sx={{
            borderRadius: 2,
            mx: 1,
            my: 0.5,
            minHeight: small ? 40 : 48,
            pl: small ? 4 : 2,
            position: "relative",
            overflow: "hidden",
            background: isActive ? alpha(iconStyle.color, 0.1) : "transparent",
            "&:hover": {
              background: alpha(iconStyle.color, 0.08),
            },
            "&::before": isActive
              ? {
                  content: '""',
                  position: "absolute",
                  left: 0,
                  top: 0,
                  bottom: 0,
                  width: 4,
                  background: iconStyle.gradient,
                  borderRadius: "0 4px 4px 0",
                }
              : {},
          }}
        >
          {icon && (
            <ListItemIcon sx={{ minWidth: 40 }}>
              {showBadge ? (
                <Badge
                  badgeContent="!"
                  color="error"
                  overlap="circular"
                  sx={{
                    "& .MuiBadge-badge": {
                      fontSize: "10px",
                      height: 16,
                      minWidth: 16,
                      padding: "0 4px",
                    },
                  }}
                >
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: iconStyle.color,
                    }}
                  >
                    {icon}
                  </Box>
                </Badge>
              ) : (
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: iconStyle.color,
                  }}
                >
                  {icon}
                </Box>
              )}
            </ListItemIcon>
          )}
          <ListItemText
            primary={
              <Typography
                sx={{
                  fontSize: "0.875rem",
                  fontWeight: isActive ? 600 : 500,
                  color: isActive ? iconStyle.color : "#777",
                }}
              >
                {primary}
              </Typography>
            }
          />
        </ListItem>
      </li>
    </ConditionalTooltip>
  );
}

const reducer = (state, action) => {
  if (action.type === "LOAD_CHATS") {
    const chats = action.payload;
    const newChats = [];

    if (isArray(chats)) {
      chats.forEach((chat) => {
        const chatIndex = state.findIndex((u) => u.id === chat.id);
        if (chatIndex !== -1) {
          state[chatIndex] = chat;
        } else {
          newChats.push(chat);
        }
      });
    }

    return [...state, ...newChats];
  }

  if (action.type === "UPDATE_CHATS") {
    const chat = action.payload;
    const chatIndex = state.findIndex((u) => u.id === chat.id);

    if (chatIndex !== -1) {
      state[chatIndex] = chat;
      return [...state];
    } else {
      return [chat, ...state];
    }
  }

  if (action.type === "DELETE_CHAT") {
    const chatId = action.payload;
    const chatIndex = state.findIndex((u) => u.id === chatId);
    if (chatIndex !== -1) {
      state.splice(chatIndex, 1);
    }
    return [...state];
  }

  if (action.type === "RESET") {
    return [];
  }

  if (action.type === "CHANGE_CHAT") {
    const changedChats = state.map((chat) => {
      if (chat.id === action.payload.chat.id) {
        return action.payload.chat;
      }
      return chat;
    });
    return changedChats;
  }
};

const MainListItems = ({ collapsed, drawerClose }) => {
  const theme = useTheme();
  const { whatsApps } = useContext(WhatsAppsContext);
  const { user, socket } = useContext(AuthContext);
  const { setActiveMenu } = useActiveMenu();
  const location = useLocation();

  const [connectionWarning, setConnectionWarning] = useState(false);
  const [openCampaignSubmenu, setOpenCampaignSubmenu] = useState(false);
  const [openFlowSubmenu, setOpenFlowSubmenu] = useState(false);
  const [openDashboardSubmenu, setOpenDashboardSubmenu] = useState(false);
  const [showCampaigns, setShowCampaigns] = useState(false);
  const [showKanban, setShowKanban] = useState(false);
  const [planExpired, setPlanExpired] = useState(false);
  const [showOpenAi, setShowOpenAi] = useState(false);
  const [showIntegrations, setShowIntegrations] = useState(false);
  const [showSchedules, setShowSchedules] = useState(false);
  const [showInternalChat, setShowInternalChat] = useState(false);
  const [showExternalApi, setShowExternalApi] = useState(false);
  const [invisible, setInvisible] = useState(true);
  const [pageNumber, setPageNumber] = useState(1);
  const [searchParam] = useState("");
  const [chats, dispatch] = useReducer(reducer, []);
  const [version, setVersion] = useState(false);
  const { list } = useHelps();
  const [hasHelps, setHasHelps] = useState(false);

  useEffect(() => {
    async function checkHelps() {
      const helps = await list();
      setHasHelps(helps.length > 0);
    }
    checkHelps();
  }, []);

  const isManagementActive =
    location.pathname === "/" ||
    location.pathname.startsWith("/reports") ||
    location.pathname.startsWith("/moments");

  const isCampaignRouteActive =
    location.pathname === "/campaigns" ||
    location.pathname.startsWith("/contact-lists") ||
    location.pathname.startsWith("/campaigns-config");

  const isFlowbuilderRouteActive =
    location.pathname.startsWith("/phrase-lists") ||
    location.pathname.startsWith("/flowbuilders");

  useEffect(() => {
    if (location.pathname.startsWith("/tickets")) {
      setActiveMenu("/tickets");
    } else {
      setActiveMenu("");
    }
  }, [location, setActiveMenu]);

  const { getPlanCompany } = usePlans();
  const { getVersion } = useVersion();

  useEffect(() => {
    async function fetchVersion() {
      const _version = await getVersion();
      setVersion(_version.version);
    }
    fetchVersion();
  }, []);

  useEffect(() => {
    dispatch({ type: "RESET" });
    setPageNumber(1);
  }, [searchParam]);

  useEffect(() => {
    async function fetchData() {
      const companyId = user.companyId;
      const planConfigs = await getPlanCompany(undefined, companyId);

      setShowCampaigns(planConfigs.plan.useCampaigns);
      setShowKanban(planConfigs.plan.useKanban);
      setShowOpenAi(planConfigs.plan.useOpenAi);
      setShowIntegrations(planConfigs.plan.useIntegrations);
      setShowSchedules(planConfigs.plan.useSchedules);
      setShowInternalChat(planConfigs.plan.useInternalChat);
      setShowExternalApi(planConfigs.plan.useExternalApi);
      setPlanExpired(moment(moment().format()).isBefore(user.company.dueDate));
    }
    fetchData();
  }, []);

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchChats();
    }, 500);
    return () => clearTimeout(delayDebounceFn);
  }, [searchParam, pageNumber]);

  useEffect(() => {
    if (user.id) {
      const companyId = user.companyId;
      const onCompanyChatMainListItems = (data) => {
        if (data.action === "new-message") {
          dispatch({ type: "CHANGE_CHAT", payload: data });
        }
        if (data.action === "update") {
          dispatch({ type: "CHANGE_CHAT", payload: data });
        }
      };

      socket.on(`company-${companyId}-chat`, onCompanyChatMainListItems);
      return () => {
        socket.off(`company-${companyId}-chat`, onCompanyChatMainListItems);
      };
    }
  }, [socket]);

  useEffect(() => {
    let unreadsCount = 0;
    if (chats.length > 0) {
      for (let chat of chats) {
        for (let chatUser of chat.users) {
          if (chatUser.userId === user.id) {
            unreadsCount += chatUser.unreads;
          }
        }
      }
    }
    if (unreadsCount > 0) {
      setInvisible(false);
    } else {
      setInvisible(true);
    }
  }, [chats, user.id]);

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      if (whatsApps.length > 0) {
        const offlineWhats = whatsApps.filter((whats) => {
          return (
            whats.status === "qrcode" ||
            whats.status === "PAIRING" ||
            whats.status === "DISCONNECTED" ||
            whats.status === "TIMEOUT" ||
            whats.status === "OPENING"
          );
        });
        if (offlineWhats.length > 0) {
          setConnectionWarning(true);
        } else {
          setConnectionWarning(false);
        }
      }
    }, 2000);
    return () => clearTimeout(delayDebounceFn);
  }, [whatsApps]);

  const fetchChats = async () => {
    try {
      const { data } = await api.get("/chats/", {
        params: { searchParam, pageNumber },
      });
      dispatch({ type: "LOAD_CHATS", payload: data.records });
    } catch (err) {
      toastError(err);
    }
  };

  // Section Header Component
  const SectionHeader = ({ children }) => (
    <Typography
      sx={{
        fontWeight: 700,
        fontSize: "0.75rem",
        textTransform: "uppercase",
        color: "#777",
        padding: "16px 16px 8px",
        lineHeight: 1,
        letterSpacing: "0.5px",
      }}
    >
      {children}
    </Typography>
  );

  // Submenu Item Component
  const SubmenuItem = ({ to, primary, icon, iconKey }) => (
    <ListItemLink
      small
      to={to}
      primary={primary}
      icon={icon}
      iconKey={iconKey}
      tooltip={collapsed}
    />
  );

  return (
    <div onClick={drawerClose}>
      {planExpired && (
        <Can
          role={
            (user.profile === "user" && user.showDashboard === "enabled") ||
            user.allowRealTime === "enabled"
              ? "admin"
              : user.profile
          }
          perform={"drawer-admin-items:view"}
          yes={() => (
            <>
              <Tooltip
                title={
                  collapsed ? i18n.t("mainDrawer.listItems.management") : ""
                }
                placement="right"
              >
                <ListItem
                  button
                  onClick={() => setOpenDashboardSubmenu((prev) => !prev)}
                  sx={{
                    borderRadius: 2,
                    mx: 1,
                    my: 0.5,
                    minHeight: 48,
                    background: isManagementActive
                      ? alpha(iconStyles.dashboard.color, 0.1)
                      : "transparent",
                    "&:hover": {
                      background: alpha(iconStyles.dashboard.color, 0.08),
                    },
                  }}
                >
                  <ListItemIcon sx={{ minWidth: 40 }}>
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: iconStyles.dashboard.color,
                      }}
                    >
                      <DashboardOutlined />
                    </Box>
                  </ListItemIcon>
                  <ListItemText
                    primary={
                      <Typography
                        sx={{
                          fontSize: "0.875rem",
                          fontWeight: isManagementActive ? 600 : 500,
                          color: isManagementActive
                            ? iconStyles.dashboard.color
                            : "#777",
                        }}
                      >
                        {i18n.t("mainDrawer.listItems.management")}
                      </Typography>
                    }
                  />
                  {openDashboardSubmenu ? (
                    <ExpandLess sx={{ color: "#777" }} />
                  ) : (
                    <ExpandMore sx={{ color: "#777" }} />
                  )}
                </ListItem>
              </Tooltip>

              <Collapse
                in={openDashboardSubmenu}
                timeout="auto"
                unmountOnExit
                sx={{
                  backgroundColor: alpha("#000000", 0.02),
                  mx: 1,
                  borderRadius: 2,
                }}
              >
                <Can
                  role={
                    user.profile === "user" && user.showDashboard === "enabled"
                      ? "admin"
                      : user.profile
                  }
                  perform={"drawer-admin-items:view"}
                  yes={() => (
                    <>
                      <SubmenuItem
                        to="/"
                        primary="Dashboard"
                        icon={<DashboardOutlined />}
                        iconKey="dashboard"
                      />
                      <SubmenuItem
                        to="/reports"
                        primary={i18n.t("mainDrawer.listItems.reports")}
                        icon={<DescriptionRounded />}
                        iconKey="dashboard"
                      />
                    </>
                  )}
                />
                <Can
                  role={
                    user.profile === "user" && user.allowRealTime === "enabled"
                      ? "admin"
                      : user.profile
                  }
                  perform={"drawer-admin-items:view"}
                  yes={() => (
                    <SubmenuItem
                      to="/moments"
                      primary={i18n.t("mainDrawer.listItems.chatsTempoReal")}
                      icon={<GridOnRounded />}
                      iconKey="dashboard"
                    />
                  )}
                />
              </Collapse>
            </>
          )}
        />
      )}

      {planExpired && (
        <ListItemLink
          to="/tickets"
          primary={i18n.t("mainDrawer.listItems.tickets")}
          icon={<WhatsApp />}
          iconKey="tickets"
          tooltip={collapsed}
        />
      )}

      {planExpired && (
        <ListItemLink
          to="/quick-messages"
          primary={i18n.t("mainDrawer.listItems.quickMessages")}
          icon={<FlashOn />}
          iconKey="messages"
          tooltip={collapsed}
        />
      )}

      {showKanban && planExpired && (
        <ListItemLink
          to="/kanban"
          primary={i18n.t("mainDrawer.listItems.kanban")}
          icon={<ViewKanban />}
          iconKey="kanban"
          tooltip={collapsed}
        />
      )}

      {planExpired && (
        <ListItemLink
          to="/contacts"
          primary={i18n.t("mainDrawer.listItems.contacts")}
          icon={<ContactPhoneOutlined />}
          iconKey="contacts"
          tooltip={collapsed}
        />
      )}

      {showSchedules && planExpired && (
        <ListItemLink
          to="/schedules"
          primary={i18n.t("mainDrawer.listItems.schedules")}
          icon={<Schedule />}
          iconKey="schedules"
          tooltip={collapsed}
        />
      )}

      {planExpired && (
        <ListItemLink
          to="/tags"
          primary={i18n.t("mainDrawer.listItems.tags")}
          icon={<LocalOffer />}
          iconKey="tags"
          tooltip={collapsed}
        />
      )}

      {showInternalChat && planExpired && (
        <ListItemLink
          to="/chats"
          primary={i18n.t("mainDrawer.listItems.chats")}
          icon={
            <Badge
              color="secondary"
              variant="dot"
              invisible={invisible}
              sx={{
                "& .MuiBadge-dot": {
                  backgroundColor: "#ef4444",
                },
              }}
            >
              <Forum />
            </Badge>
          }
          iconKey="chats"
          tooltip={collapsed}
        />
      )}

      {hasHelps && planExpired && (
        <ListItemLink
          to="/helps"
          primary={i18n.t("mainDrawer.listItems.helps")}
          icon={<HelpOutline />}
          iconKey="helps"
          tooltip={collapsed}
        />
      )}

      <Can
        role={
          user.profile === "user" && user.allowConnections === "enabled"
            ? "admin"
            : user.profile
        }
        perform="dashboard:view"
        yes={() => (
          <>
            <Divider sx={{ mx: 2, my: 2 }} />
            <SectionHeader>
              {i18n.t("mainDrawer.listItems.administration")}
            </SectionHeader>

            {showCampaigns && planExpired && (
              <Can
                role={user.profile}
                perform="dashboard:view"
                yes={() => (
                  <>
                    <Tooltip
                      title={
                        collapsed
                          ? i18n.t("mainDrawer.listItems.campaigns")
                          : ""
                      }
                      placement="right"
                    >
                      <ListItem
                        button
                        onClick={() => setOpenCampaignSubmenu((prev) => !prev)}
                        sx={{
                          borderRadius: 2,
                          mx: 1,
                          my: 0.5,
                          minHeight: 48,
                          background: isCampaignRouteActive
                            ? alpha(iconStyles.campaigns.color, 0.1)
                            : "transparent",
                          "&:hover": {
                            background: alpha(iconStyles.campaigns.color, 0.08),
                          },
                        }}
                      >
                        <ListItemIcon sx={{ minWidth: 40 }}>
                          <Box
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              color: iconStyles.campaigns.color,
                            }}
                          >
                            <Campaign />
                          </Box>
                        </ListItemIcon>
                        <ListItemText
                          primary={
                            <Typography
                              sx={{
                                fontSize: "0.875rem",
                                fontWeight: isCampaignRouteActive ? 600 : 500,
                                color: isCampaignRouteActive
                                  ? iconStyles.campaigns.color
                                  : "#777",
                              }}
                            >
                              {i18n.t("mainDrawer.listItems.campaigns")}
                            </Typography>
                          }
                        />
                        {openCampaignSubmenu ? (
                          <ExpandLess sx={{ color: "#777" }} />
                        ) : (
                          <ExpandMore sx={{ color: "#777" }} />
                        )}
                      </ListItem>
                    </Tooltip>

                    <Collapse
                      in={openCampaignSubmenu}
                      timeout="auto"
                      unmountOnExit
                      sx={{
                        backgroundColor: alpha("#000000", 0.02),
                        mx: 1,
                        borderRadius: 2,
                      }}
                    >
                      <List dense component="div" disablePadding>
                        <SubmenuItem
                          to="/campaigns"
                          primary={i18n.t("campaigns.subMenus.list")}
                          icon={<ListAlt />}
                          iconKey="campaigns"
                        />
                        <SubmenuItem
                          to="/contact-lists"
                          primary={i18n.t("campaigns.subMenus.listContacts")}
                          icon={<People />}
                          iconKey="campaigns"
                        />
                        <SubmenuItem
                          to="/campaigns-config"
                          primary={i18n.t("campaigns.subMenus.settings")}
                          icon={<SettingsOutlined />}
                          iconKey="campaigns"
                        />
                      </List>
                    </Collapse>
                  </>
                )}
              />
            )}

            {planExpired && (
              <Can
                role={user.profile}
                perform="dashboard:view"
                yes={() => (
                  <>
                    <Tooltip
                      title={collapsed ? i18n.t("Flowbuilder") : ""}
                      placement="right"
                    >
                      <ListItem
                        button
                        onClick={() => setOpenFlowSubmenu((prev) => !prev)}
                        sx={{
                          borderRadius: 2,
                          mx: 1,
                          my: 0.5,
                          minHeight: 48,
                          background: isFlowbuilderRouteActive
                            ? alpha(iconStyles.flowbuilder.color, 0.1)
                            : "transparent",
                          "&:hover": {
                            background: alpha(
                              iconStyles.flowbuilder.color,
                              0.08
                            ),
                          },
                        }}
                      >
                        <ListItemIcon sx={{ minWidth: 40 }}>
                          <Box
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              color: iconStyles.flowbuilder.color,
                            }}
                          >
                            <WebhookRounded />
                          </Box>
                        </ListItemIcon>
                        <ListItemText
                          primary={
                            <Typography
                              sx={{
                                fontSize: "0.875rem",
                                fontWeight: isFlowbuilderRouteActive
                                  ? 600
                                  : 500,
                                color: isFlowbuilderRouteActive
                                  ? iconStyles.flowbuilder.color
                                  : "#777",
                              }}
                            >
                              {i18n.t("Flowbuilder")}
                            </Typography>
                          }
                        />
                        {openFlowSubmenu ? (
                          <ExpandLess sx={{ color: "#777" }} />
                        ) : (
                          <ExpandMore sx={{ color: "#777" }} />
                        )}
                      </ListItem>
                    </Tooltip>

                    <Collapse
                      in={openFlowSubmenu}
                      timeout="auto"
                      unmountOnExit
                      sx={{
                        backgroundColor: alpha("#000000", 0.02),
                        mx: 1,
                        borderRadius: 2,
                      }}
                    >
                      <List dense component="div" disablePadding>
                        <SubmenuItem
                          to="/phrase-lists"
                          primary="Fluxo de Campanha"
                          icon={<EventAvailable />}
                          iconKey="flowbuilder"
                        />
                        <SubmenuItem
                          to="/flowbuilders"
                          primary="Fluxo de conversa"
                          icon={<ShapeLineRounded />}
                          iconKey="flowbuilder"
                        />
                      </List>
                    </Collapse>
                  </>
                )}
              />
            )}

            {user.super && (
              <ListItemLink
                to="/announcements"
                primary={i18n.t("mainDrawer.listItems.annoucements")}
                icon={<Announcement />}
                iconKey="announcements"
                tooltip={collapsed}
              />
            )}

            {showExternalApi && planExpired && (
              <Can
                role={user.profile}
                perform="dashboard:view"
                yes={() => (
                  <ListItemLink
                    to="/messages-api"
                    primary={i18n.t("mainDrawer.listItems.messagesAPI")}
                    icon={<CodeRounded />}
                    iconKey="api"
                    tooltip={collapsed}
                  />
                )}
              />
            )}

            {planExpired && (
              <Can
                role={user.profile}
                perform="dashboard:view"
                yes={() => (
                  <ListItemLink
                    to="/users"
                    primary={i18n.t("mainDrawer.listItems.users")}
                    icon={<PeopleAltOutlined />}
                    iconKey="users"
                    tooltip={collapsed}
                  />
                )}
              />
            )}

            {planExpired && (
              <Can
                role={user.profile}
                perform="dashboard:view"
                yes={() => (
                  <ListItemLink
                    to="/queues"
                    primary={i18n.t("mainDrawer.listItems.queues")}
                    icon={<AccountTreeOutlined />}
                    iconKey="queues"
                    tooltip={collapsed}
                  />
                )}
              />
            )}

            {showOpenAi && planExpired && (
              <Can
                role={user.profile}
                perform="dashboard:view"
                yes={() => (
                  <ListItemLink
                    to="/prompts"
                    primary={i18n.t("mainDrawer.listItems.prompts")}
                    icon={<AllInclusiveRounded />}
                    iconKey="prompts"
                    tooltip={collapsed}
                  />
                )}
              />
            )}

            {showIntegrations && planExpired && (
              <Can
                role={user.profile}
                perform="dashboard:view"
                yes={() => (
                  <ListItemLink
                    to="/queue-integration"
                    primary={i18n.t("mainDrawer.listItems.queueIntegration")}
                    icon={<DeviceHubRounded />}
                    iconKey="integrations"
                    tooltip={collapsed}
                  />
                )}
              />
            )}

            {planExpired && (
              <Can
                role={
                  user.profile === "user" && user.allowConnections === "enabled"
                    ? "admin"
                    : user.profile
                }
                perform={"drawer-admin-items:view"}
                yes={() => (
                  <ListItemLink
                    to="/connections"
                    primary={i18n.t("mainDrawer.listItems.connections")}
                    icon={<SyncAlt />}
                    iconKey="connections"
                    showBadge={connectionWarning}
                    tooltip={collapsed}
                  />
                )}
              />
            )}

            {user.super && (
              <ListItemLink
                to="/allConnections"
                primary={i18n.t("mainDrawer.listItems.allConnections")}
                icon={<PhonelinkSetupRounded />}
                iconKey="connections"
                tooltip={collapsed}
              />
            )}

            {planExpired && (
              <Can
                role={user.profile}
                perform="dashboard:view"
                yes={() => (
                  <ListItemLink
                    to="/files"
                    primary={i18n.t("mainDrawer.listItems.files")}
                    icon={<AttachFileRounded />}
                    iconKey="files"
                    tooltip={collapsed}
                  />
                )}
              />
            )}

            <Can
              role={user.profile}
              perform="dashboard:view"
              yes={() => (
                <ListItemLink
                  to="/financeiro"
                  primary={i18n.t("mainDrawer.listItems.financeiro")}
                  icon={<LocalAtm />}
                  iconKey="financial"
                  tooltip={collapsed}
                />
              )}
            />

            {planExpired && (
              <Can
                role={user.profile}
                perform="dashboard:view"
                yes={() => (
                  <ListItemLink
                    to="/settings"
                    primary={i18n.t("mainDrawer.listItems.settings")}
                    icon={<SettingsOutlined />}
                    iconKey="settings"
                    tooltip={collapsed}
                  />
                )}
              />
            )}

            {user.super && (
              <ListItemLink
                to="/companies"
                primary={i18n.t("mainDrawer.listItems.companies")}
                icon={<Business />}
                iconKey="companies"
                tooltip={collapsed}
              />
            )}
          </>
        )}
      />

      {!collapsed && (
        <React.Fragment>
          <Divider sx={{ mx: 2, my: 2 }} />
          <Box
            sx={{
              p: 2,
              textAlign: "center",
              borderRadius: 2,
              mx: 2,
              mb: 1,
            }}
          >
            <Chip
              label="v.9.0"
              size="small"
              sx={{
                background: iconStyles.dashboard.gradient,
                color: "white",
                fontWeight: 600,
                fontSize: "0.75rem",
              }}
            />
          </Box>
        </React.Fragment>
      )}
    </div>
  );
};

export default MainListItems;
