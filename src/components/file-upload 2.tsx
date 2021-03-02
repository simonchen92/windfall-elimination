import React from "react";
import styled from "@emotion/styled";
import fastXml from "fast-xml-parser";
import pdfJS from "pdfjs-dist";
import { spacing, colors, fontSizes } from "../constants";
import {  H2 } from "../components";
import { getRawEarnings } from "../library/observable-functions";
import { EarningsRecord, useUserState, UserState } from '../library/user-state-context'
import { useUserStateActions, UserStateActions } from '../library/user-state-actions-context'

//Make sure that the worker version matches package.json pdfjs-dist version.
pdfJS.GlobalWorkerOptions.workerSrc = "https://cdn.jsdelivr.net/npm/pdfjs-dist@2.1.266/build/pdf.worker.js";

//Upload page specific css/html
export const UploadButton = styled("div")`
  position: relative;
  margin: ${spacing[2]} ${spacing[0]};
  overflow: hidden;
  background-color: ${colors.white};
  font-size: ${fontSizes[1]};
  border-radius: 25px;
  border: 2px solid ${colors.black};
  color: ${colors.purple};
  text-decoration: none;
  display: block;
  text-align: center;
  width: 300px;
  &:hover {
    background-color: ${colors.lightBlue};
  }
`;

export const UploadInput = styled("input")`
  visibility: hidden;
  position: relative;
  width: 300px;
  height: 50px;
  z-index: 1;
`;

export const UploadLabel = styled("label")`
  position: absolute;
  font-size: ${fontSizes[1]};
  width: 300px;
  height: 50px;
  padding-top 13px;
  padding-bottom: 3px;
`;

export const DisplayTable = styled.div`
  display: flex;
  flex-direction: column;
  flex-wrap: wrap;
  justify-content: start;
  margin: 20px 0 20px 0;
  max-height: 1800px;
  max-width: 555px;
  padding-right: 10px;
`;

export const TableHeader = styled("th")`
  background-color: #dddddd;
  border: 1px solid #dddddd;
  text-align: left;
  padding: 8px;
`;

export const TableRow = styled("tr")`
  border: 1px solid #dddddd;
`;

export const TableInput = styled("input")`
  height: 45px;
  width: 150px;
  border-radius: 0 3px 3px 0;
  font-size: 18px;
  font-family: "Montserrat", sans-serif;
  padding-left: 5px;
`;

export const YearLabel = styled("label")`
  background-color: #dddddd;
  font-weight: 800;
`;

export const InputField = styled.div`
  border-radius: 3px;
`;

export const TD = styled.div`
  border: 2px solid ${colors.gray};
  border-radius: 3px;
  display: flex;
  width: 240px;
  margin-right: 10px;
`;

export const LabelBox = styled.div`
  background-color: #dddddd;
  border-radius: 3px 0 0 3px;
  padding: 10px;
  width: 60px;
`;

interface GenerateTableProps {
  parsedXml: EarningsRecord | null
  manual: boolean
  manualTable: EarningsRecord
  handleInputEarnings: (year: string, value: string) => void
  handleManualEarnings: (year: string, value: string) => void
  fileName: string | null
  handleSave: () => void
}

//-------------------------------------------------

// Generates earning records table from uploaded XML file, XML parsing adapted from Amrutha
// If user uploads: use Amru's table logic
// If manual entering, use alternative table generation method.
export class GenerateTable extends React.Component<GenerateTableProps> {
  render() {
    const {
      parsedXml,
      manual,
      handleInputEarnings,
      handleManualEarnings,
      manualTable,
      handleSave,
      fileName
    } = this.props
    var tableRows;
    var earningsSize;
    if (parsedXml && manual === false) {
      var earningsYears = Object.keys(parsedXml);
      tableRows = earningsYears.map((year, i) => {
        const earningValueXML = parsedXml[year]
          ? { defaultValue: parsedXml[year] }
          : { placeholder: 0 };
        return (
          <React.Fragment key={"earning" + i}>
            <TD>
              <LabelBox>
                <YearLabel>{year}</YearLabel>
              </LabelBox>
              <TableInput
                id={year}
                {...earningValueXML}
                onChange={e => handleInputEarnings(year, e.target.value)}
              />
            </TD>
          </React.Fragment>
        );
      });
      earningsSize = tableRows.length;
    } else if (manual) {
      tableRows = Object.keys(manualTable).map((year, key) => {
        const earningValue = manualTable[year]
          ? { defaultValue: manualTable[year] }
          : { placeholder: 0 };
        return (
          <React.Fragment key={"earning" + key}>
            <TD>
              <LabelBox>
                <YearLabel>{year}</YearLabel>
              </LabelBox>
              <TableInput
                type="text"
                id={"value_" + year + "_" + key}
                {...earningValue}
                onChange={e => handleManualEarnings(year, e.target.value)}
                onBlur={handleSave}
                tabindex={parseInt(key, 10) + 1}
              ></TableInput>
            </TD>
          </React.Fragment>
        );
      });
      earningsSize = tableRows.length;
    }
    const displayFile=fileName ? "from " + fileName : ""

    return (
      <>
        {earningsSize && <H2>Year-by-year Earning Records</H2> &&
        <h3>{earningsSize} {earningsSize ? "rows" : ""} {displayFile}</h3>}
        <DisplayTable>{tableRows}</DisplayTable>
      </>
    );
  }
}

interface FileUploadProps {
  manual: boolean
  userState: UserState
  userStateActions: UserStateActions
}

interface FileUploadState {
  fileName: string | null
  displayTable: boolean
  manualTable: EarningsRecord
}

class FileUpload extends React.Component<FileUploadProps, FileUploadState> {
  fileInput = React.createRef<HTMLInputElement>()

  saveMessageRef = React.createRef<HTMLDivElement>()

  public state: FileUploadState = {
    manualTable: {},
    displayTable: false,
    fileName: null,
  }

  componentDidMount() {
    const {userState: {earnings, birthDate, retireDate}} = this.props
    if (birthDate === null || retireDate === null) return
    const earningsRecord = earnings || {}

    const startEmploymentYear = birthDate.getFullYear() + 18
    const retireYear = retireDate.getFullYear()
    const endYear = retireYear <= new Date().getFullYear() ? retireYear : new Date().getFullYear() - 1

    var tempTable = {} as EarningsRecord;
    for (var i = startEmploymentYear; i <= endYear; i++) {
      if (Object.keys(earningsRecord).includes(String(i))) {
        tempTable[i] = earningsRecord[i];
      } else {
        tempTable[i] = 0;
      }
    }

    this.setState({
      manualTable: tempTable
    });
  }

  //For uploaded records: handles the updating of stored earnings record to match inputed value
  handleInputEarnings = (modifiedYear: string, value: string) => {
    const {
      userState: {earnings},
      userStateActions: {setEarnings},
    } = this.props
    if (earnings === null) return
    var earningsYears = Object.keys(earnings);

    if (earningsYears.includes(modifiedYear)) {
      setEarnings({...earnings, [modifiedYear]: Number(value)})
    }
  }

  //Parse XML file
  handleXMLFile = (reader: ProgressEvent<FileReader>) => {
    const {userStateActions: {setEarnings}} = this.props

    if (fastXml.validate(reader.target.result) === true) {
      var parsedText = fastXml.parse(reader.target.result, {
        ignoreAttributes: false
      });

      const earnings = getRawEarnings(parsedText['osss:OnlineSocialSecurityStatementData']['osss:EarningsRecord']['osss:Earnings']) as EarningsRecord
      setEarnings(earnings)
    }
  }

  //Parse PDF file
  handlePDFFile = async (reader: ProgressEvent<FileReader>) => {
    const {userStateActions: {setEarnings}} = this.props
    if (reader.target === null || reader.target.result === null) return
    //Returns first page of document
    var combinedValues = [];
    await pdfJS.getDocument(reader.target.result).promise.then(async (ssaDoc: pdfJS.PDFDocumentProxy) => {
      var earningsPage;
      for (var page of Array(ssaDoc.numPages).keys()) {
        const docPage = ssaDoc.getPage(page + 1);
        await Promise.resolve(docPage)
          .then(pageContent => pageContent.getTextContent())
          .then(doc => {
            var textheader = doc.items.slice(0, 10);
            for (var text of textheader) {
              var textstr = text.str.replace(/ /g, "");
              if (textstr === "YourEarningsRecord") {
                earningsPage = doc;
                return;
              }
            }
          });
      }

      earningsPage.items.forEach(item => {
        var filter = Number(item.str.replace(",", "").replace(" ", ""));
        if (!Number.isNaN(filter)) {
          combinedValues.push(filter);
        }
      });
    });

    var currentRecord = {};
    do {
      var newvalue = combinedValues.shift();
      if (newvalue > 1900) {       
        currentRecord[newvalue] = combinedValues.shift();
        //This call is necessary for skipping medicare values.
        combinedValues.shift();
      }
    } while (combinedValues.length > 0);

    setEarnings(currentRecord)
  }

  handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (this.fileInput.current === null || this.fileInput.current.files === null) return
    e.preventDefault();
    const {files} = this.fileInput.current

    this.setState({
      displayTable: true,
      fileName: files[0].name
    });
    const file = files[0];
    const nameParts = files[0].name.split('.');
    const extension = nameParts[nameParts.length - 1];
    var reader = new FileReader();

    switch (extension) {
      case "xml":
        reader.onload = reader => this.handleXMLFile(reader);
        reader.readAsText(file);
        break;

      case "pdf":
        reader.onload = reader => this.handlePDFFile(reader);
        reader.readAsArrayBuffer(file);
        break;

      default:
        alert("I'm sorry, that file was not recognized.");
        break;
    }
  }

  //Stores users input for manually entered table to allow for persistence across page changes
  handleManualEarnings = (year: string, value: string) => {
    var tempManualTable = this.state.manualTable;

    if (Object.keys(tempManualTable).includes(year)) {
      tempManualTable[year] = Number(value);
    }

    this.setState({
      manualTable: tempManualTable
    });
  }

  showSaveMessage = () => {
    const saveMessageEl = this.saveMessageRef.current
    if (saveMessageEl) {
      saveMessageEl.style.display = "grid";
      setTimeout(function() {
        saveMessageEl.style.display = "none";
      }, 3000);
    }
  }

  //Saves manually entered record to this.state.earningsRecord object, becomes noticable to Observable API
  handleSave = () => {
    const {
      userState: {earnings},
      userStateActions: {setEarnings},
    } = this.props
    //Load earnings record; if not present, set default record.
    var tempRecord = earnings ?? {}

    //Update global earnings record with the manually inputed values
    Object.keys(this.state.manualTable).forEach((year, i) => {
      tempRecord[year] = this.state.manualTable[year];
    });

    setEarnings(tempRecord)
    this.showSaveMessage()
  }

  render() {
    const {manual, userState: {earnings}} = this.props
    return (
      <div className="upload-form">
        {!manual && (
          <UploadButton>
            <UploadLabel htmlFor="inputfile" className="btn">
              Upload Earnings Record
            </UploadLabel>
            <UploadInput
              type="file"
              id="inputfile"
              ref={this.fileInput}
              onChange={this.handleUpload}
            ></UploadInput>
          </UploadButton>
        )}
        <GenerateTable
          parsedXml={earnings}
          handleInputEarnings={this.handleInputEarnings}
          manual={this.props.manual}
          manualTable={this.state.manualTable}
          handleManualEarnings={this.handleManualEarnings}
          handleSave={this.handleSave}
          fileName={this.state.fileName || null}
        />
        <div ref={this.saveMessageRef} style={{ display: "none" }}>
          Record has been saved.
        </div>
      </div>
    );
  }
}

type FileUploadWrapperProps = Omit<FileUploadProps, 'userState' | 'userStateActions'>

export default function FileUploadWrapper(props: FileUploadWrapperProps) {
  const {manual} = props
  const userStateActions = useUserStateActions()
  const userState = useUserState()
  return (
    <FileUpload manual={manual} userState={userState} userStateActions={userStateActions} />
  )
}
