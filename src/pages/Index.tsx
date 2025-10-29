import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';

type Operation = '+' | '-' | '×' | '÷' | 'sin' | 'cos' | 'tan' | 'log' | 'ln' | '^' | '√' | '%' | null;

interface HistoryItem {
  expression: string;
  result: string;
  timestamp: Date;
}

export default function Index() {
  const [display, setDisplay] = useState('0');
  const [previousValue, setPreviousValue] = useState<number | null>(null);
  const [operation, setOperation] = useState<Operation>(null);
  const [newNumber, setNewNumber] = useState(true);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [showAd, setShowAd] = useState(true);

  const handleNumber = (num: string) => {
    if (newNumber) {
      setDisplay(num);
      setNewNumber(false);
    } else {
      setDisplay(display === '0' ? num : display + num);
    }
  };

  const handleDecimal = () => {
    if (!display.includes('.')) {
      setDisplay(display + '.');
      setNewNumber(false);
    }
  };

  const handleOperation = (op: Operation) => {
    const currentValue = parseFloat(display);
    
    if (previousValue !== null && !newNumber) {
      calculate();
    }
    
    setPreviousValue(currentValue);
    setOperation(op);
    setNewNumber(true);
  };

  const handleScientific = (func: 'sin' | 'cos' | 'tan' | 'log' | 'ln' | '√') => {
    const value = parseFloat(display);
    let result: number;

    switch (func) {
      case 'sin':
        result = Math.sin(value * Math.PI / 180);
        break;
      case 'cos':
        result = Math.cos(value * Math.PI / 180);
        break;
      case 'tan':
        result = Math.tan(value * Math.PI / 180);
        break;
      case 'log':
        result = Math.log10(value);
        break;
      case 'ln':
        result = Math.log(value);
        break;
      case '√':
        result = Math.sqrt(value);
        break;
      default:
        return;
    }

    const expression = `${func}(${display})`;
    const resultStr = result.toString();
    addToHistory(expression, resultStr);
    setDisplay(resultStr);
    setNewNumber(true);
  };

  const calculate = () => {
    if (previousValue === null || operation === null) return;

    const current = parseFloat(display);
    let result: number;

    switch (operation) {
      case '+':
        result = previousValue + current;
        break;
      case '-':
        result = previousValue - current;
        break;
      case '×':
        result = previousValue * current;
        break;
      case '÷':
        result = previousValue / current;
        break;
      case '^':
        result = Math.pow(previousValue, current);
        break;
      case '%':
        result = previousValue % current;
        break;
      default:
        return;
    }

    const expression = `${previousValue} ${operation} ${current}`;
    const resultStr = result.toString();
    addToHistory(expression, resultStr);
    setDisplay(resultStr);
    setPreviousValue(null);
    setOperation(null);
    setNewNumber(true);
  };

  const addToHistory = (expression: string, result: string) => {
    setHistory([{ expression, result, timestamp: new Date() }, ...history.slice(0, 19)]);
  };

  const clear = () => {
    setDisplay('0');
    setPreviousValue(null);
    setOperation(null);
    setNewNumber(true);
  };

  const backspace = () => {
    if (display.length > 1) {
      setDisplay(display.slice(0, -1));
    } else {
      setDisplay('0');
    }
  };

  const buttonClass = "h-16 text-lg font-semibold rounded-full transition-all hover:scale-105 active:scale-95";
  const numberButtonClass = `${buttonClass} bg-card hover:bg-card/80 text-foreground`;
  const operationButtonClass = `${buttonClass} bg-secondary/20 hover:bg-secondary/30 text-secondary-foreground`;
  const specialButtonClass = `${buttonClass} bg-accent/20 hover:bg-accent/30 text-accent-foreground`;

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 p-4 flex items-center justify-center">
      <div className="w-full max-w-5xl">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              Калькулятор Pro
            </h1>
            <p className="text-muted-foreground mt-1">Научный калькулятор с расширенными функциями</p>
          </div>
          
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" size="lg" className="rounded-full">
                <Icon name="Settings" className="mr-2" />
                Админ-панель
              </Button>
            </SheetTrigger>
            <SheetContent className="w-[400px] sm:w-[540px]">
              <SheetHeader>
                <SheetTitle>Панель администратора</SheetTitle>
              </SheetHeader>
              <div className="mt-6 space-y-6">
                <div className="flex items-center justify-between">
                  <Label htmlFor="ad-toggle">Показывать рекламу</Label>
                  <Switch
                    id="ad-toggle"
                    checked={showAd}
                    onCheckedChange={setShowAd}
                  />
                </div>
                
                <div className="space-y-2">
                  <h3 className="text-sm font-semibold">Статистика</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <Card className="p-4">
                      <div className="text-2xl font-bold text-primary">{history.length}</div>
                      <div className="text-xs text-muted-foreground">Вычислений</div>
                    </Card>
                    <Card className="p-4">
                      <div className="text-2xl font-bold text-secondary">24/7</div>
                      <div className="text-xs text-muted-foreground">Работает</div>
                    </Card>
                  </div>
                </div>

                <div className="space-y-2">
                  <h3 className="text-sm font-semibold">История вычислений</h3>
                  <ScrollArea className="h-[300px] rounded-xl border border-border p-4">
                    {history.length === 0 ? (
                      <div className="text-center text-muted-foreground py-8">
                        <Icon name="Calculator" className="mx-auto mb-2" size={48} />
                        <p>История пуста</p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {history.map((item, index) => (
                          <Card key={index} className="p-3 hover:bg-accent/5 transition-colors cursor-pointer" onClick={() => setDisplay(item.result)}>
                            <div className="text-sm text-muted-foreground">{item.expression}</div>
                            <div className="text-lg font-semibold text-foreground">= {item.result}</div>
                            <div className="text-xs text-muted-foreground mt-1">
                              {item.timestamp.toLocaleTimeString('ru-RU')}
                            </div>
                          </Card>
                        ))}
                      </div>
                    )}
                  </ScrollArea>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <Card className="p-6 backdrop-blur-lg bg-card/50 border-2 rounded-3xl shadow-2xl">
              <div className="mb-6 p-6 bg-gradient-to-br from-muted/30 to-muted/10 rounded-2xl border border-border/50">
                <div className="text-right">
                  {operation && previousValue !== null && (
                    <div className="text-sm text-muted-foreground mb-1">
                      {previousValue} {operation}
                    </div>
                  )}
                  <div className="text-5xl font-bold text-foreground break-all">{display}</div>
                </div>
              </div>

              <Tabs defaultValue="basic" className="w-full">
                <TabsList className="grid w-full grid-cols-2 mb-4 rounded-full p-1">
                  <TabsTrigger value="basic" className="rounded-full">Базовый</TabsTrigger>
                  <TabsTrigger value="scientific" className="rounded-full">Научный</TabsTrigger>
                </TabsList>
                
                <TabsContent value="basic" className="space-y-3">
                  <div className="grid grid-cols-4 gap-3">
                    <Button onClick={clear} className={specialButtonClass}>C</Button>
                    <Button onClick={backspace} className={specialButtonClass}>
                      <Icon name="Delete" />
                    </Button>
                    <Button onClick={() => handleOperation('%')} className={operationButtonClass}>%</Button>
                    <Button onClick={() => handleOperation('÷')} className={operationButtonClass}>÷</Button>
                  </div>
                  
                  <div className="grid grid-cols-4 gap-3">
                    <Button onClick={() => handleNumber('7')} className={numberButtonClass}>7</Button>
                    <Button onClick={() => handleNumber('8')} className={numberButtonClass}>8</Button>
                    <Button onClick={() => handleNumber('9')} className={numberButtonClass}>9</Button>
                    <Button onClick={() => handleOperation('×')} className={operationButtonClass}>×</Button>
                  </div>
                  
                  <div className="grid grid-cols-4 gap-3">
                    <Button onClick={() => handleNumber('4')} className={numberButtonClass}>4</Button>
                    <Button onClick={() => handleNumber('5')} className={numberButtonClass}>5</Button>
                    <Button onClick={() => handleNumber('6')} className={numberButtonClass}>6</Button>
                    <Button onClick={() => handleOperation('-')} className={operationButtonClass}>−</Button>
                  </div>
                  
                  <div className="grid grid-cols-4 gap-3">
                    <Button onClick={() => handleNumber('1')} className={numberButtonClass}>1</Button>
                    <Button onClick={() => handleNumber('2')} className={numberButtonClass}>2</Button>
                    <Button onClick={() => handleNumber('3')} className={numberButtonClass}>3</Button>
                    <Button onClick={() => handleOperation('+')} className={operationButtonClass}>+</Button>
                  </div>
                  
                  <div className="grid grid-cols-4 gap-3">
                    <Button onClick={() => handleNumber('0')} className={`${numberButtonClass} col-span-2`}>0</Button>
                    <Button onClick={handleDecimal} className={numberButtonClass}>.</Button>
                    <Button onClick={calculate} className={`${buttonClass} bg-gradient-to-r from-primary to-secondary hover:opacity-90 text-primary-foreground`}>=</Button>
                  </div>
                </TabsContent>
                
                <TabsContent value="scientific" className="space-y-3">
                  <div className="grid grid-cols-4 gap-3">
                    <Button onClick={() => handleScientific('sin')} className={specialButtonClass}>sin</Button>
                    <Button onClick={() => handleScientific('cos')} className={specialButtonClass}>cos</Button>
                    <Button onClick={() => handleScientific('tan')} className={specialButtonClass}>tan</Button>
                    <Button onClick={() => handleOperation('÷')} className={operationButtonClass}>÷</Button>
                  </div>
                  
                  <div className="grid grid-cols-4 gap-3">
                    <Button onClick={() => handleScientific('log')} className={specialButtonClass}>log</Button>
                    <Button onClick={() => handleScientific('ln')} className={specialButtonClass}>ln</Button>
                    <Button onClick={() => handleOperation('^')} className={specialButtonClass}>x^y</Button>
                    <Button onClick={() => handleOperation('×')} className={operationButtonClass}>×</Button>
                  </div>
                  
                  <div className="grid grid-cols-4 gap-3">
                    <Button onClick={() => handleScientific('√')} className={specialButtonClass}>√</Button>
                    <Button onClick={() => handleNumber('(')} className={numberButtonClass}>(</Button>
                    <Button onClick={() => handleNumber(')')} className={numberButtonClass}>)</Button>
                    <Button onClick={() => handleOperation('-')} className={operationButtonClass}>−</Button>
                  </div>
                  
                  <div className="grid grid-cols-4 gap-3">
                    <Button onClick={clear} className={specialButtonClass}>C</Button>
                    <Button onClick={backspace} className={specialButtonClass}>
                      <Icon name="Delete" />
                    </Button>
                    <Button onClick={handleDecimal} className={numberButtonClass}>.</Button>
                    <Button onClick={() => handleOperation('+')} className={operationButtonClass}>+</Button>
                  </div>
                  
                  <div className="grid grid-cols-4 gap-3">
                    <Button onClick={() => handleNumber('0')} className={`${numberButtonClass} col-span-3`}>0</Button>
                    <Button onClick={calculate} className={`${buttonClass} bg-gradient-to-r from-primary to-secondary hover:opacity-90 text-primary-foreground`}>=</Button>
                  </div>
                </TabsContent>
              </Tabs>
            </Card>
          </div>

          <div className="space-y-6">
            <Card className="p-6 rounded-3xl backdrop-blur-lg bg-card/50 border-2">
              <div className="flex items-center gap-2 mb-4">
                <Icon name="History" className="text-primary" />
                <h2 className="text-lg font-semibold">История</h2>
              </div>
              <ScrollArea className="h-[400px]">
                {history.length === 0 ? (
                  <div className="text-center text-muted-foreground py-12">
                    <Icon name="Calculator" className="mx-auto mb-2" size={48} />
                    <p>Начните вычисления</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {history.slice(0, 10).map((item, index) => (
                      <Card 
                        key={index} 
                        className="p-3 hover:bg-accent/10 transition-all cursor-pointer hover:scale-[1.02] rounded-2xl" 
                        onClick={() => setDisplay(item.result)}
                      >
                        <div className="text-xs text-muted-foreground">{item.expression}</div>
                        <div className="text-base font-semibold text-foreground">= {item.result}</div>
                      </Card>
                    ))}
                  </div>
                )}
              </ScrollArea>
            </Card>

            {showAd && (
              <Card className="p-6 rounded-3xl bg-gradient-to-br from-primary/10 to-secondary/10 border-2 border-primary/20">
                <Badge className="mb-3 rounded-full">Реклама</Badge>
                <h3 className="text-lg font-semibold mb-2">Премиум функции</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Получите доступ к графикам, матрицам и сохранению в облаке
                </p>
                <Button className="w-full rounded-full bg-gradient-to-r from-primary to-secondary hover:opacity-90">
                  Узнать больше
                </Button>
              </Card>
            )}
          </div>
        </div>

        {showAd && (
          <Card className="mt-6 p-6 rounded-3xl bg-gradient-to-r from-accent/10 via-primary/10 to-secondary/10 border-2 border-accent/20 text-center">
            <div className="flex items-center justify-center gap-4">
              <Icon name="Sparkles" className="text-primary" size={32} />
              <div className="text-left">
                <h3 className="text-xl font-bold">Улучшите свои расчёты</h3>
                <p className="text-sm text-muted-foreground">Профессиональные инструменты для студентов и инженеров</p>
              </div>
              <Button size="lg" className="rounded-full bg-gradient-to-r from-primary to-secondary hover:opacity-90 ml-auto">
                Попробовать бесплатно
              </Button>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}
