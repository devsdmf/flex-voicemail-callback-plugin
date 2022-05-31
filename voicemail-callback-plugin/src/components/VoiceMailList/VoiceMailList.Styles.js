import { default as styled } from "react-emotion";
import Tooltip from "@material-ui/core/Tooltip";
import TableCell from "@material-ui/core/TableCell";
import { withStyles } from "@material-ui/core/styles";

export const useStyles = (theme) => ({
  root: {
    padding: theme.spacing.unit * 3,
    backgroundColor: theme.colors.base1,
  },
  table: {
    minWidth: 300,
  },
});

export const HtmlTooltip = withStyles((theme) => ({
  tooltip: {
    backgroundColor: "#f5f5f9",
    color: "rgba(0, 0, 0, 0.87)",
    maxWidth: 400,
    fontSize: theme.typography.pxToRem(12),
    border: "1px solid #dadde9",
  },
}))(Tooltip);

export const StyledHeaderTableCell = withStyles((theme) => ({
  root: {
    fontWeight: "bold",
    verticalAlign: "top",
  },
}))(TableCell);

export const StyledButtonContainer = styled("div")`
  display: flex;
  flex-direction: row;
`;
