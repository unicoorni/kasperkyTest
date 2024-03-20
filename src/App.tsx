import React, {RefObject, useRef} from "react";
import "./App.css";
import { Layout, Button, Modal  } from 'antd';

class InputEngine {
    element: RefObject<HTMLInputElement>
    constructor(element: RefObject<HTMLInputElement>) {
        this.element = element

    }

    public parseSyntax(arrInput: string[]) {
        const stack: string[] = [];
        const output: string[] = [];
        for (let i = 0; i < arrInput.length; i++) {
            if (arrInput[i] === "(" || arrInput[i] === ")") {
                stack.push(arrInput[i]);
            }
            const lengthStackOpen = stack.filter((el) => el === "(").length;
            const lengthStackClose = stack.filter((el) => el === ")").length;
            if (lengthStackOpen % 2 !== lengthStackClose % 2) {
                output.push(`<span class="green">${arrInput[i]}</span>`);
                stack.pop();
                continue;
            }

            if (arrInput[i] === "(" || arrInput[i] === ")") {
                output.push(`<span class="green">${arrInput[i]}</span>`);
                continue;
            }
            if (arrInput[i] === "OR" || arrInput[i] === "AND") {
                output.push(`<span class="orange">${arrInput[i]}</span>`);
                continue;
            }
            output.push(`<span class="blue">${arrInput[i]}</span>`);
        }
        return output
    }

    public validate(basicInput: string) {
        let input: string | string[] = basicInput
        const bracketExp = /("(?:[^"\\]|\\.)*"|(?![AND]|[OR])([а-яА-Яa-zA-Z]+))/g
        const words  = input.match(bracketExp) as string[]
        words.forEach((el) => {
            if (typeof input === 'string') {
                input = input.replace(el, '#')
            }
        })
        input = input.replaceAll(/ /g, '').replaceAll('AND', '*').replaceAll('OR', '|').replaceAll('&nbsp;', '')
        input = input.split('').filter(el => el.charCodeAt(0) !== 160)

        if (input.includes('"')) {
            return {
                status: false,
                detail: `В строке не хватает кавычки`,
            }
        }

        let start = 0
        let end = 0
        let prev = ''
        let current = ''
        let response = {
            status: true,
            detail: `Вы молодец!`,
        }
        console.log(input.join(''))
        charParser: for (let i = 0; i< input.length; i++) {
            if (input[i] === '(') {
                start ++
            } else if (input[i] === ')') {
                end ++
            } else {
                current = input[i]
                if (['#'].indexOf(current) >= 0 && ['#'].indexOf(prev) >= 0) {
                    response =  {
                        status: false,
                        detail: 'У вас ошибка в запросе',
                    }
                    break charParser
                }
                if (['|', '*'].indexOf(current) >= 0 && ['|', '*'].indexOf(prev) >= 0) {
                    response =  {
                        status: false,
                        detail: 'Ошибка логических операторов',
                    }
                    break charParser
                }

                prev = current
            }
        }
        if (!response.status) return  response

        if (start < end ) {

            return {
                status: false,
                detail: `В строке не хватает открывающейся скобки`,
            }

        } else if (start > end) {
            return {
                status: false,
                detail: `В строке не хватает закрывающейся скобки`,
            }
        }

        return response

    }
}
export const App = () => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [input, setInput] = React.useState('')
  const [Input, setInputEngine] = React.useState<InputEngine>()
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [errorMessage, setErrorMessage] = React.useState('')

    const showModal = () => {
        setIsModalOpen(true);
    };

    const handleOk = () => {
        setIsModalOpen(false);
    };

    const handleCancel = () => {
        setIsModalOpen(false);
    };

  const checkValid = (input: string) =>  {
    if (Input === undefined) return 0

    const logicConstruction = input;
    const separator = /(\(|\)|OR|AND|\[|\])/g;
    const arrInput = logicConstruction.split(separator);
    const output: string[] = Input.parseSyntax(arrInput);

    const response = Input.validate(input);
    if (!response.status) {
        showModal()
        setErrorMessage(response.detail)

    }
    (inputRef.current as HTMLDivElement).innerHTML = output.join("");
  }

  React.useEffect(() => {
      setInputEngine( new InputEngine(inputRef) as InputEngine)
  },[])


  return (
    <Layout style={{
        width: '80vw',
        height: 400,
        backgroundColor: 'transparent',
        display: 'flex',
        alignItems: 'center',
        flexDirection: 'column',
        justifyContent: 'space-between',
        gap: 10

    }}>
        <Layout
            className='ant-input ant-input-outlined'
            style={{
                width: '100%',
                display: 'flex',
                flexDirection: 'row'
            }}
            contentEditable
            onInput={({target: {textContent}}: React.ChangeEvent<HTMLDivElement>) => setInput(textContent as string)}
            ref={inputRef} />

        <Button type="primary" size='large' style={{width: '50%'}} onClick={() => checkValid(input)}>Проверить</Button >

        <Modal title="Ошибка синтаксиса!" open={isModalOpen} onOk={handleOk} onCancel={handleCancel}>
            <p>{errorMessage}</p>
        </Modal>
    </Layout>
  );
};
export default App;
