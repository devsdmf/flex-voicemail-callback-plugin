import styled from "react-emotion";
import Input from "@material-ui/core/Input";

export const Container = styled("div")`
  display: flex;
  flex-direction: column;
  align-items: center;
`;

export const SectionHeader = styled("div")`
  flex: 0 0 auto;
  font-size: 10px;
  font-weight: bold;
  letter-spacing: 2px;
  border-style: solid;
  padding-left: 11px;
  height: 24px;
  border-width: 0 0 1px 0;
  text-transform: uppercase;
  margin-top: 24px;
  border-color: rgb(96, 100, 113);
`;

export const SpacedBoldText = styled("div")`
  margin-top: 15px;
  margin-bottom: 15px;
  font-weight: bold;
]]]`;

export const ButtonsContainer = styled("div")`
  margin-top: 24px;
  padding-left: 12px;
  padding-right: 12px;
  overflow-x: hidden;
  overflow-y: auto;
  justify-content: center;
  & > * {
    margin-left: 6px;
    margin-right: 6px;
    min-width: 100px;
  }
`;

export const ExtensionInput = styled(Input)`
  flex: 0 0 0px;
  height: 32px;
  width: 56px;
`;
