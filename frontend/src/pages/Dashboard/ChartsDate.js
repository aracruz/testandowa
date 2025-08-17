import React, { useEffect, useState, useContext } from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Bar } from "react-chartjs-2";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import brLocale from "date-fns/locale/pt-BR";
import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { Button, Grid, TextField } from "@material-ui/core";
import Typography from "@material-ui/core/Typography";
import api from "../../services/api";
import { format } from "date-fns";
import { toast } from "react-toastify";
import { i18n } from "../../translate/i18n";
import { AuthContext } from "../../context/Auth/AuthContext";
import { useTheme } from "@material-ui/core";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

export const ChartsDate = () => {
  const theme = useTheme();
  const [initialDate, setInitialDate] = useState(new Date());
  const [finalDate, setFinalDate] = useState(new Date());
  const [ticketsData, setTicketsData] = useState({ data: [], count: 0 });
  const { user } = useContext(AuthContext);
  const companyId = user.companyId;

  useEffect(() => {
    if (companyId) {
      handleGetTicketsInformation();
    }
  }, [companyId]);

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        backgroundColor: theme.palette.background.paper,
        titleColor: theme.palette.text.primary,
        bodyColor: theme.palette.text.secondary,
        borderColor: theme.palette.divider,
        borderWidth: 1,
        padding: 12,
        bodyFont: {
          weight: "500",
        },
        titleFont: {
          size: 14,
          weight: "600",
        },
      },
      title: {
        display: true,
        text: "TICKETS",
        position: "left",
        color: theme.palette.text.secondary,
        font: {
          size: 12,
          weight: "600",
        },
        padding: {
          bottom: 20,
        },
      },
    },
    scales: {
      x: {
        grid: {
          display: false,
          drawBorder: false,
        },
        ticks: {
          color: theme.palette.text.secondary,
          font: {
            weight: "500",
          },
        },
      },
      y: {
        grid: {
          color: theme.palette.divider,
          drawBorder: false,
        },
        ticks: {
          color: theme.palette.text.secondary,
          padding: 8,
        },
      },
    },
    animation: {
      duration: 1000,
    },
  };

  const dataCharts = {
    labels: ticketsData?.data.map((item) =>
      item.hasOwnProperty("horario")
        ? `${item.horario}:00-${item.horario}:59`
        : item.data
    ),
    datasets: [
      {
        data: ticketsData?.data.map((item) => item.total),
        backgroundColor: theme.palette.primary.main,
        hoverBackgroundColor: theme.palette.primary.dark,
        borderRadius: 6,
        borderSkipped: false,
        barThickness: 24,
      },
    ],
  };

  const handleGetTicketsInformation = async () => {
    try {
      const { data } = await api.get(
        `/dashboard/ticketsDay?initialDate=${format(
          initialDate,
          "yyyy-MM-dd"
        )}&finalDate=${format(finalDate, "yyyy-MM-dd")}&companyId=${companyId}`
      );
      setTicketsData(data);
    } catch (error) {
      toast.error("Erro ao buscar informações dos tickets");
    }
  };

  return (
    <div style={{ padding: "24px 16px" }}>
      <Typography
        component="h2"
        variant="h6"
        style={{
          color: theme.palette.text.primary,
          marginBottom: 24,
          fontWeight: 600,
          fontSize: "1.1rem",
          display: "flex",
          alignItems: "center",
        }}
      >
        {i18n.t("dashboard.users.totalAttendances")}
        <span
          style={{
            color: theme.palette.primary.main,
            marginLeft: 8,
            fontWeight: 700,
          }}
        >
          ({ticketsData?.count})
        </span>
      </Typography>

      <Grid container spacing={2} style={{ marginBottom: 24 }}>
        <Grid item xs={12} sm={6} md={4}>
          <LocalizationProvider
            dateAdapter={AdapterDateFns}
            adapterLocale={brLocale}
          >
            <DatePicker
              value={initialDate}
              onChange={setInitialDate}
              label={i18n.t("dashboard.date.initialDate")}
              renderInput={(params) => (
                <TextField
                  {...params}
                  variant="outlined"
                  fullWidth
                  size="small"
                  style={{
                    backgroundColor: theme.palette.background.paper,
                  }}
                  inputProps={{
                    style: {
                      padding: "12px 14px",
                      color: theme.palette.text.primary,
                    },
                  }}
                  InputLabelProps={{
                    style: {
                      color: theme.palette.text.secondary,
                    },
                  }}
                />
              )}
            />
          </LocalizationProvider>
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <LocalizationProvider
            dateAdapter={AdapterDateFns}
            adapterLocale={brLocale}
          >
            <DatePicker
              value={finalDate}
              onChange={setFinalDate}
              label={i18n.t("dashboard.date.finalDate")}
              renderInput={(params) => (
                <TextField
                  {...params}
                  variant="outlined"
                  fullWidth
                  size="small"
                  style={{
                    backgroundColor: theme.palette.background.paper,
                  }}
                  inputProps={{
                    style: {
                      padding: "12px 14px",
                      color: theme.palette.text.primary,
                    },
                  }}
                  InputLabelProps={{
                    style: {
                      color: theme.palette.text.secondary,
                    },
                  }}
                />
              )}
            />
          </LocalizationProvider>
        </Grid>
        <Grid item xs={12} sm={12} md={4}>
          <Button
            variant="contained"
            onClick={handleGetTicketsInformation}
            fullWidth
            style={{
              backgroundColor: theme.palette.primary.main,
              color: theme.palette.primary.contrastText,
              height: "40px",
              fontWeight: 600,
              fontSize: "0.875rem",
              textTransform: "none",
              boxShadow: "none",
              borderRadius: "8px",
            }}
          >
            Filtrar
          </Button>
        </Grid>
      </Grid>

      <div style={{ height: "400px", marginTop: "16px" }}>
        <Bar options={options} data={dataCharts} />
      </div>
    </div>
  );
};

export default ChartsDate;
