// *******************************************************************************************************************************************************************************************
// Internal functions
function doSelectPrice(world, prices)
{
  global.ConsoleLog("selectPrice");
  //global.ConsoleLog(prices);
  global.ConsoleLog("the product discount code is: " + world.discountcode);
  global.ConsoleLog("the client price level is " + world.pricelevel);
  var result =
  {
    price: 0.0,
    minqty: null,
    maxqty: null
  };
  var clientid = world.clientid;
  global.ConsoleLog("the selected client id is " + clientid);
  var qty = (__.isUndefined(world.qty) || (world.qty == 0.0)) ? null : __.toBigNum(world.qty);
  //global.ConsoleLog(qty);
  global.ConsoleLog(prices.length);


  var matchidPrices = prices.filter(val => {
        return val.clientid == clientid;
      });
  global.ConsoleLog(matchidPrices.length); 

  var nullPrices = prices.filter(val => {
    return val.clientid == null;
  });
  global.ConsoleLog(nullPrices.length); 

  if(__.isNull(world.discountcode))
  {
    global.ConsoleLog("product does not have a discount code, use the traditonal way to select the price, match client id, or default, match qty, and not expired");
    if(matchidPrices.length > 0)
    {
      global.ConsoleLog("there are matches from the selected arrary, either match with client id, or client id is null because don't select");
      prices = matchidPrices;

      for (var ndx = 0; ndx<prices.length;ndx++)
      {
        global.ConsoleLog("Loop " + ndx);
        var p = prices[ndx];
        if(__.isNull(p.minqty) && __.isNull(p.maxqty))
        {
          global.ConsoleLog("this entry does not have minqty and maxqty, doesn't care what qty use enters, use it and break the loop");
          result = p;
          break;
        }
        else
        {
          if(!__.isNull(qty))
          {
            if(!__.isNull(p.minqty))
            {
              global.ConsoleLog("this entry has the min qty");
              result = p;
    
              if(qty.lessThanOrEqualTo(p.minqty))
              {
                global.ConsoleLog("qty is less than entry's minimum, we use this entry's min and we're done");
                break;
              }
              else if (__.isNull(p.maxqty) || qty.lessThanOrEqualTo(p.maxqty))
              {
                global.ConsoleLog("ebtered qty is less than entry's max or the maxqty is null,used the price, break the loop");
                break;
              }
            }
    
            if(!__.isNull(p.maxqty))
            {
              global.ConsoleLog("this entry has the max qty");
              if(qty.lessThanOrEqualTo(p.maxqty))
              {
                result = p;
                break;
              }
            }
          }
          else
          {
            global.ConsoleLog("no enter the qty, so use the first available one");
            result = p;
            break;
          }
        }
        
        
      }

    }
    else if (nullPrices.length > 0)
    {
      global.ConsoleLog("there are no matches from the selected arrary based on the selected client id, so need to use the default list, where the client id is null");
      prices = nullPrices;
      for (var ndx = 0; ndx<prices.length;ndx++)
      {
        var p = prices[ndx];
        if(__.isNull(p.minqty) && __.isNull(p.maxqty))
        {
          global.ConsoleLog("this entry does not have minqty and maxqty, doesn't care what qty use enters, use it and break the loop");
          result = p;
          break;
        }
        else
        {
          if(!__.isNull(qty))
          {
    
            // if(__.isNull(p.minqty) && __.isNull(p.maxqty))
            // {
            //   global.ConsoleLog("this entry no minqty and maxqty, use it and break the loop");
            //   result = p;
            //   break;
            // }
            //else
            //{
              if(!__.isNull(p.minqty))
              {
                global.ConsoleLog("this entry has the min qty");
                result = p;
      
                if(qty.lessThanOrEqualTo(p.minqty))
                {
                  global.ConsoleLog("qty is less than or equal to entry's minimum, we use this entry's min and we're done");
                  break;
                }
                else if (__.isNull(p.maxqty))
                {
                  global.ConsoleLog("this entry does not have the maxqty, it is null, and entered qty is greater than the minqty, break the loop");
                  break;
                }
              }
      
              if(!__.isNull(p.maxqty))
              {
                global.ConsoleLog("this entry has the max qty");
                if(qty.lessThanOrEqualTo(p.maxqty))
                {
                  global.ConsoleLog("entered qty is less than entry's max or the maxqty is null,used the price, break the loop");
                  result = p;
                  break;
                }
              }
          // }
          }
          else
          {
            global.ConsoleLog("no enter the qty, so use the first available one, which is the one with the least minqty");
            result = p;
            break;
          }
        }
        
        
      }
    }
  }
  else
  {
    global.ConsoleLog("product have discount code, need to use the price level match client's, ignore the speicifc enteries");
    // global.ConsoleLog(prices[0]);
    var selectedprice = prices[0];
    global.ConsoleLog(selectedprice);
    var uselevel = 'price' + world.pricelevel;
    global.ConsoleLog(uselevel);
    var useprice = selectedprice[uselevel];
    global.ConsoleLog(useprice);
    // selectedprice = selectedprice.slice(0,23);
    // global.ConsoleLog(selectedprice);

    // result.price = useprice;
    result = selectedprice;

  }
    // if(__.isNull(p.clientid) && !__.isNull(clientid));
    // {
    //   global.ConsoleLog("this entry is not specific to a client, but it select one, move on to next iteration");
    //   continue;
    // }

    // // If entry is specific to client but we haven't specified one, then skip this entry entirely...
    // if (!__.isNull(p.clientid) && __.isNull(clientid))
    // {
    //   global.ConsoleLog("this entry is specific to a client, and this doesn't select one, move on to next iteration");
    //   continue;
    // }
      

    // // If entry is specific to client and we've specified one, then if not the same skip this entry entirely...
    // if (!__.isNull(p.clientid) && !__.isNull(clientid) && (p.clientid != clientid))
    // {
    //   global.ConsoleLog("this entry is specific to a client, and we have selected one, but it doesn't match, so move on to the next iteration");
    //   continue;
    // }


    // if(!__.isNull(p.clientid) && !__.isNull(clientid) && (p.clientid == clientid))
    // {
    //   global.ConsoleLog("this entry is specific to a client, and we have selected one, but it match, work");
    //   // Qty supplied, so we need to do a range check ...
    //   if (!__.isNull(qty))
    //   {
    //     global.ConsoleLog("has specific quantity, need to check the range");
    //     // Entry has no min or max qty, we'll accept this but continue searching (for better entries with range specific match)
    //     if (__.isNull(p.minqty) && __.isNull(p.maxqty))
    //     {
    //       global.ConsoleLog("Entry has no min or max qty, we'll accept this but continue searching (for better entries with range specific match)");
    //       result = p;
    //       continue;
    //     }

    //     // Entry has min qty...
    //     if (!__.isNull(p.minqty))
    //     {
    //       global.ConsoleLog("Entry has min qty...");

    //       result = p;

    //       // If qty is less than entry's minimum, we use this entry's min and we're done, else we continue, check for max boundary
    //       if (qty.lessThanOrEqualTo(p.minqty))
    //       {
    //         global.ConsoleLog("If qty is less than entry's minimum, we use this entry's min and we're done, else we continue, check for max boundary");
    //         break;
    //       }
          
    //     }

    //     // Entry has max qty we must match...
    //     if (!__.isNull(p.maxqty))
    //     {
    //       global.ConsoleLog("Entry has max qty...");
    //       global.ConsoleLog(p.maxqty);
    //       if (qty.lessThanOrEqualTo(p.maxqty))
    //       {
    //         global.ConsoleLog("If qty is less than entry's max, break the loop");
    //         result = p;
    //         break;
    //       }
    //     }
    //   }
    //   else
    //   {
    //     // Accept first available entry as we match anything...
    //     global.ConsoleLog("no specific quantity, so use the first available one");

    //     result = p;
    //     break;
    //   }

    // }



    // // Qty supplied, so we need to do a range check ...
    // if (!__.isNull(qty))
    // {
    //   global.ConsoleLog("has specific quantity, need to check the range");
    //   // Entry has no min or max qty, we'll accept this but continue searching (for better entries with range specific match)
    //   if (__.isNull(p.minqty) && __.isNull(p.maxqty))
    //   {
    //     global.ConsoleLog("Entry has no min or max qty, we'll accept this but continue searching (for better entries with range specific match)");
    //     result = p;
    //     continue;
    //   }

    //   // Entry has min qty...
    //   if (!__.isNull(p.minqty))
    //   {
    //     global.ConsoleLog("Entry has min qty...");

    //     result = p;

    //     // If qty is less than entry's minimum, we use this entry's min and we're done, else we continue, check for max boundary
    //     if (qty.lessThanOrEqualTo(p.minqty))
    //     {
    //       global.ConsoleLog("If qty is less than entry's minimum, we use this entry's min and we're done, else we continue, check for max boundary");
    //       break;
    //     }
         
    //   }

    //   // Entry has max qty we must match...
    //   if (!__.isNull(p.maxqty))
    //   {
    //     global.ConsoleLog("Entry has max qty...");
    //     global.ConsoleLog(p.maxqty);
    //     if (qty.lessThanOrEqualTo(p.maxqty))
    //     {
    //       global.ConsoleLog("If qty is less than entry's max, break the loop");
    //       result = p;
    //       break;
    //     }
    //   }
    // }
    // else
    // {
    //   // Accept first available entry as we match anything...
    //   global.ConsoleLog("no specific quantity, so use the first available one");

    //   result = p;
    //   break;
    // }
  //}

  //global.ConsoleLog(result);
  return result;
}

function doNewProductCode(tx, world)
{
  var promise = new global.rsvp.Promise
  (
    function(resolve, reject)
    {
      tx.query
      (
        'insert into productcodes (customers_id,products_id,suppliers_id,code,barcode,userscreated_id) values ($1,$2,$3,$4,$5,$6) returning id',
        [
          world.cn.custid,
          __.sanitiseAsBigInt(world.productid),
          __.sanitiseAsBigInt(world.supplierid),
          __.sanitiseAsString(world.code, 50),
          __.sanitiseAsString(world.barcode, 50),
          world.cn.userid
        ],
        function(err, result)
        {
          if (!err)
          {
            var productcodeid = result.rows[0].id;
            tx.query
            (
              'select pc1.datecreated,u1.name usercreated from productcodes pc1 left join users u1 on (pc1.userscreated_id=u1.id) where pc1.customers_id=$1 and pc1.id=$2',
              [
                world.cn.custid,
                __.sanitiseAsBigInt(productcodeid)
              ],
              function(err, result)
              {
                if (!err)
                {
                  var p = result.rows[0];

                  resolve
                  (
                    {
                      productid: world.productid,
                      productcodeid: productcodeid,
                      datecreated: global.moment(p.datecreated).format('YYYY-MM-DD HH:mm:ss'),
                      usercreated: p.usercreated
                    }
                  );
                }
                else
                  reject({message: global.text_unablenewproduct});
              }
            );
          }
          else
            reject(err);
        }
      );
    }
  );
  return promise;
}

function doNewProduct(tx, world)
{
  var promise = new global.rsvp.Promise
  (
    function(resolve, reject)
    {
      var buytaxcodeid = __.isUNB(world.buytaxcodeid) ? __.sanitiseAsBigInt(world.custconfig.productbuytaxcodeid) : __.sanitiseAsBigInt(world.buytaxcodeid);
      var selltaxcodeid = __.isUNB(world.selltaxcodeid) ? __.sanitiseAsBigInt(world.custconfig.productselltaxcodeid) : __.sanitiseAsBigInt(world.selltaxcodeid);

      tx.query
      (
        'insert into products (customers_id,productcategories_id,code,name,altcode,barcode,costprice,costgst,uom,uomsize,clients_id,isactive,buytaxcodes_id,selltaxcodes_id,costofgoodsaccounts_id,incomeaccounts_id,assetaccounts_id,buildtemplateheaders_id,minstockqty,stockqtywarnthreshold,width,length,height,weight,price1,price2,price3,price4,price5,price6,price7,price8,price9,price10,price11,price12,attrib1,attrib2,attrib3,attrib4,attrib5,productsalias_id,locations1_id,locations2_id,userscreated_id,discountcode_id, listcode_id, sale_uom, sale_uomsize, price13, price14, price15) values ($1,$2,$3,$4,$5,$6,$7,calctaxcomponent($8,$9,$10),$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,$21,$22,$23,$24,$25,$26,$27,$28,$29,$30,$31,$32,$33,$34,$35,$36,$37,$38,$39,$40,$41,$42,$43,$44,$45,$46,$47,$48,$49,$50,$51,$52,$53,$54) returning id',
        [
          world.cn.custid,
          __.sanitiseAsBigInt(world.productcategoryid),
          __.sanitiseAsString(world.code, 50),
          __.sanitiseAsString(world.name, 50),
          __.sanitiseAsString(world.altcode, 50),
          __.sanitiseAsString(world.barcode, 50),
          __.notNullNumeric(world.costprice, 4),
          //
          world.cn.custid,
          __.notNullNumeric(world.costprice, 4),
          buytaxcodeid,
          //
          __.sanitiseAsString(world.uom, 50),
          __.formatuomsize(world.uomsize),
          __.sanitiseAsBigInt(world.clientid),
          __.sanitiseAsBool(world.isactive),
          buytaxcodeid,
          selltaxcodeid,
          __.sanitiseAsBigInt(world.costofgoodsaccountid),
          __.sanitiseAsBigInt(world.incomeaccountid),
          __.sanitiseAsBigInt(world.assetaccountid),
          //
          __.sanitiseAsBigInt(world.buildtemplateid),
          __.sanitiseAsPrice(world.minqty, 4),
          __.sanitiseAsPrice(world.warnqty, 4),
          //
          __.sanitiseAsPrice(world.width, 4),
          __.sanitiseAsPrice(world.length, 4),
          __.sanitiseAsPrice(world.height, 4),
          __.sanitiseAsPrice(world.weight, 4),
          //
          __.sanitiseAsPrice(world.price1, 4),
          __.sanitiseAsPrice(world.price2, 4),
          __.sanitiseAsPrice(world.price3, 4),
          __.sanitiseAsPrice(world.price4, 4),
          __.sanitiseAsPrice(world.price5, 4),
          __.sanitiseAsPrice(world.price6, 4),
          __.sanitiseAsPrice(world.price7, 4),
          __.sanitiseAsPrice(world.price8, 4),
          __.sanitiseAsPrice(world.price9, 4),
          __.sanitiseAsPrice(world.price10, 4),
          __.sanitiseAsPrice(world.price11, 4),
          __.sanitiseAsPrice(world.price12, 4),
          //
          __.sanitiseAsString(world.attrib1, 50),
          __.sanitiseAsString(world.attrib2, 50),
          __.sanitiseAsString(world.attrib3, 50),
          __.sanitiseAsString(world.attrib4, 50),
          __.sanitiseAsString(world.attrib5, 50),
          //
          __.sanitiseAsBigInt(world.productaliasid),
          __.sanitiseAsBigInt(world.location1id),
          __.sanitiseAsBigInt(world.location2id), 
          //
          world.cn.userid, //47

          //new added columns 
          __.sanitiseAsBigInt(world.discountcodeid), //48
          __.sanitiseAsBigInt(world.listpricecodeid), //49
          __.sanitiseAsString(world.saleuom, 50), //50
          __.formatuomsize(world.saleuomsize), //51
          __.sanitiseAsPrice(world.price13, 4), //52
          __.sanitiseAsPrice(world.price14, 4), //53
          __.sanitiseAsPrice(world.price15, 4), //54
        ],
        function(err, result)
        {
          if (!err)
          {
            var productid = result.rows[0].id;
            tx.query
            (
              'select p1.datecreated,u1.name usercreated from products p1 left join users u1 on (p1.userscreated_id=u1.id) where p1.customers_id=$1 and p1.id=$2',
              [
                world.cn.custid,
                __.sanitiseAsBigInt(productid)
              ],
              function(err, result)
              {
                if (!err)
                {
                  var p = result.rows[0];

                  resolve
                  (
                    {
                      productid: productid,
                      datecreated: global.moment(p.datecreated).format('YYYY-MM-DD HH:mm:ss'),
                      usercreated: p.usercreated
                    }
                  );
                }
                else
                  reject({message: global.text_unablenewproduct});
              }
            );
          }
          else
            reject(err);
        }
      );
    }
  );
  return promise;
}

function doSaveProduct(tx, world)
{
  var promise = new global.rsvp.Promise
  (
    function(resolve, reject)
    {
      var cp = __.sanitiseAsPrice(world.costprice, 4);

      tx.query
      (
        'update ' +
        'products ' +
        'set ' +
        'code=$1,' +
        'name=$2,' +
        'altcode=$3,' +
        'costprice=$4,' +
        'costgst=calctaxcomponent($5,$6,$7),' +
        'uom=$8,' +
        'uomsize=$9,' +
        'sale_uom=$53,' +
        'sale_uomsize=$54,' +
        'clients_id=$10,' +
        'isactive=$11,' +
        'buytaxcodes_id=$12,' +
        'selltaxcodes_id=$13,' +
        'costofgoodsaccounts_id=$14,' +
        'incomeaccounts_id=$15,' +
        'assetaccounts_id=$16,' +
        'buildtemplateheaders_id=$17,' +
        'minstockqty=$18,' +
        'stockqtywarnthreshold=$19,' +
        'width=$20,' +
        'length=$21,' +
        'height=$22,' +
        'weight=$23,' +
        'price1=$24,' +
        'price2=$25,' +
        'price3=$26,' +
        'price4=$27,' +
        'price5=$28,' +
        'price6=$29,' +
        'price7=$30,' +
        'price8=$31,' +
        'price9=$32,' +
        'price10=$33,' +
        'price11=$34,' +
        'price12=$35,' +
        'price13=$36,' +
        'price14=$37,' +
        'price15=$38,' +
        'attrib1=$39,' +
        'attrib2=$40,' +
        'attrib3=$41,' +
        'attrib4=$42,' +
        'attrib5=$43,' +
        'barcode=$44,' +
        'productsalias_id=$45,' +
        'locations1_id=$46,' +
        'locations2_id=$47,' +
        'discountcode_id=$48,' +
        'listcode_id=$49,' +
        'datemodified=now(),' +
        'usersmodified_id=$50 ' +
        'where ' +
        'customers_id=$51 ' +
        'and ' +
        'id=$52 ' +
        'and ' +
        'dateexpired is null',
        [
          __.sanitiseAsString(world.code, 50),
          __.sanitiseAsString(world.name, 50),
          __.sanitiseAsString(world.altcode, 50),
          __.notNullNumeric(world.costprice, 4),
          //
          world.cn.custid,
          __.notNullNumeric(world.costprice, 4),
          __.sanitiseAsBigInt(world.buytaxcodeid),
          //
          __.sanitiseAsString(world.uom, 50),
          __.formatuomsize(world.uomsize),
          __.sanitiseAsBigInt(world.clientid),
          __.sanitiseAsBool(world.isactive),
          __.sanitiseAsBigInt(world.buytaxcodeid),
          __.sanitiseAsBigInt(world.selltaxcodeid),
          __.sanitiseAsBigInt(world.costofgoodsaccountid),
          __.sanitiseAsBigInt(world.incomeaccountid),
          __.sanitiseAsBigInt(world.assetaccountid),
          //
          __.sanitiseAsBigInt(world.buildtemplateid),
          __.sanitiseAsPrice(world.minqty, 4),
          __.sanitiseAsPrice(world.warnqty, 4),
          //
          __.sanitiseAsPrice(world.width, 4),
          __.sanitiseAsPrice(world.length, 4),
          __.sanitiseAsPrice(world.height, 4),
          __.sanitiseAsPrice(world.weight, 4),
          //
          __.sanitiseAsPrice(world.price1, 4),
          __.sanitiseAsPrice(world.price2, 4),
          __.sanitiseAsPrice(world.price3, 4),
          __.sanitiseAsPrice(world.price4, 4),
          __.sanitiseAsPrice(world.price5, 4),
          __.sanitiseAsPrice(world.price6, 4),
          __.sanitiseAsPrice(world.price7, 4),
          __.sanitiseAsPrice(world.price8, 4),
          __.sanitiseAsPrice(world.price9, 4),
          __.sanitiseAsPrice(world.price10, 4),
          __.sanitiseAsPrice(world.price11, 4),
          __.sanitiseAsPrice(world.price12, 4),//35
          __.sanitiseAsPrice(world.price13, 4),//36
          __.sanitiseAsPrice(world.price14, 4),//37
          __.sanitiseAsPrice(world.price15, 4),//38
          //
          __.sanitiseAsString(world.attrib1, 50), //39
          __.sanitiseAsString(world.attrib2, 50), //40
          __.sanitiseAsString(world.attrib3, 50), //41
          __.sanitiseAsString(world.attrib4, 50), //42
          __.sanitiseAsString(world.attrib5, 50), //43
          //
          __.sanitiseAsString(world.barcode, 50), //44
          //
          __.sanitiseAsBigInt(world.productaliasid), //45
          __.sanitiseAsBigInt(world.location1id), //46
          __.sanitiseAsBigInt(world.location2id), //47
          //
          __.sanitiseAsBigInt(world.discountcodeid), //48
          __.sanitiseAsBigInt(world.listcodeid), //49
          //
          world.cn.userid, //50
          world.cn.custid, //51
          world.productid, //52

          __.sanitiseAsString(world.saleuom, 50), //53
          __.formatuomsize(world.saleuomsize), //54
        ],
        function(err, result)
        {
          if (!err)
          {
            tx.query
            (
              'select p1.productcategories_id productcategoryid,p1.datemodified,u1.name from products p1 left join users u1 on (p1.usersmodified_id=u1.id) where p1.customers_id=$1 and p1.id=$2',
              [
                world.cn.custid,
                __.sanitiseAsBigInt(world.productid)
              ],
              function(err, result)
              {
                if (!err)
                  resolve({productcategoryid: result.rows[0].productcategoryid, datemodified: global.moment(result.rows[0].datemodified).format('YYYY-MM-DD HH:mm:ss'), usermodified: result.rows[0].name});
                else
                  reject(err);
              }
            );
          }
          else
            reject(err);
        }
      );
    }
  );
  return promise;
}

function doDuplicateProduct(tx, world)
{
  var promise = new global.rsvp.Promise
  (
    function(resolve, reject)
    {
      tx.query
      (
        'insert into ' +
        'products ' +
        '(' +
        'customers_id,' +
        'name,' +
        'code,' +
        'altcode,' +
        'barcode,' +
        'notes,' +
        'width,' +
        'length,' +
        'height,' +
        'weight,' +
        'uom,' +
        'uomsize,' +
        'sale_uom,' +
        'sale_uomsize,' +
        'attrib1,' +
        'attrib2,' +
        'attrib3,' +
        'attrib4,' +
        'attrib5,' +
        'productcategories_id,' +
        'buildtemplateheaders_id,' +
        'minstockqty,' +
        'stockqtywarnthreshold,' +
        'costprice,' +
        'costgst,' +
        'costofgoodsaccounts_id,' +
        'incomeaccounts_id,' +
        'assetaccounts_id,' +
        'buytaxcodes_id,' +
        'selltaxcodes_id,' +
        'isactive,' +
        'clients_id,' +
        'price1,' +
        'price2,' +
        'price3,' +
        'price4,' +
        'price5,' +
        'price6,' +
        'price7,' +
        'price8,' +
        'price9,' +
        'price10,' +
        'price11,' +
        'price12,' +
        'price13,' +
        'price14,' +
        'price15,' +
        'productsalias_id,' +
        'locations1_id,' +
        'locations2_id,' +
        'userscreated_id,' +
        'discountcode_id,' +
        'listcode_id ' +
        ') ' +
        'select ' +
        'customers_id,' +
        'name || \' copy\',' +
        'code || \' copy\',' +
        'altcode,' +
        'barcode,' +
        'notes,' +
        'width,' +
        'length,' +
        'height,' +
        'weight,' +
        'uom,' +
        'uomsize,' +
        'sale_uom,' +
        'sale_uomsize,' +
        'attrib1,' +
        'attrib2,' +
        'attrib3,' +
        'attrib4,' +
        'attrib5,' +
        'productcategories_id,' +
        'buildtemplateheaders_id,' +
        'minstockqty,' +
        'stockqtywarnthreshold,' +
        'costprice,' +
        'costgst,' +
        'costofgoodsaccounts_id,' +
        'incomeaccounts_id,' +
        'assetaccounts_id,' +
        'buytaxcodes_id,' +
        'selltaxcodes_id,' +
        'isactive,' +
        'clients_id,' +
        'price1,' +
        'price2,' +
        'price3,' +
        'price4,' +
        'price5,' +
        'price6,' +
        'price7,' +
        'price8,' +
        'price9,' +
        'price10,' +
        'price11,' +
        'price12,' +
        'price13,' +
        'price14,' +
        'price15,' +
        'productsalias_id,' +
        'locations1_id,' +
        'locations2_id,' +
        '$1, ' +
        'discountcode_id,' +
        'listcode_id ' +
        'from ' +
        'products ' +
        'where ' +
        'customers_id=$2 ' +
        'and ' +
        'id=$3 ' +
        'returning id',
        [
          world.cn.userid,
          world.cn.custid,
          __.sanitiseAsBigInt(world.productid)
        ],
        function(err, result)
        {
          if (!err)
          {
            var productid = result.rows[0].id;

            tx.query
            (
              'select p1.productcategories_id productcategoryid,p1.datecreated,u1.name usercreated from products p1 left join users u1 on (p1.userscreated_id=u1.id) where p1.customers_id=$1 and p1.id=$2',
              [
                world.cn.custid,
                __.sanitiseAsBigInt(productid)
              ],
              function(err, result)
              {
                if (!err)
                {
                  var p = result.rows[0];

                  resolve
                  (
                    {
                      productid: productid,
                      productcategoryid: p.productcategoryid,
                      datecreated: global.moment(p.datecreated).format('YYYY-MM-DD HH:mm:ss'),
                      usercreated: p.usercreated
                    }
                  );
                }
                else
                  reject({message: global.text_unablenewproduct});
              }
            );
          }
          else
            reject(err);
        }
      );
    }
  );
  return promise;
}

function doSyncProductTemplate(tx, world)
{
  var promise = new global.rsvp.Promise
  (
    function(resolve, reject)
    {
      tx.query
      (
        'select p1.id,p1.producttemplateheaders_id producttemplateid,p1.name from getchildrenofproducttemplateheader($1,$2) p1',
        [
          world.cn.custid,
          __.sanitiseAsBigInt(world.producttemplateid)
        ],
        function(err, result)
        {
          if (!err)
          {
            var calls = [];

            result.rows.forEach
            (
              function(r)
              {
                // For each sub-template, remove all the existing products and replace with the ones from supplied template instead...
                calls.push
                (
                  function(callback)
                  {
                    // Remove existing products for this template...
                    tx.query
                    (
                      'update producttemplatedetails set dateexpired=now(),usersexpired_id=$1 where customers_id=$2 and producttemplateheaders_id=$3 and dateexpired is null',
                      [
                        world.cn.userid,
                        world.cn.custid,
                        __.sanitiseAsBigInt(r.id)
                      ],
                      function(err, result)
                      {
                        if (!err)
                        {
                          // Now insert products...
                          tx.query
                          (
                            'insert into ' +
                            'producttemplatedetails ' +
                            '(' +
                            'customers_id,' +
                            'producttemplateheaders_id,' +
                            'products_id,' +
                            'pricing_id,' +
                            'qty,' +
                            'price,' +
                            'gst,' +
                            'notes,' +
                            'taxcodes_id,' +
                            'userscreated_id' +
                            ') ' +
                            'select ' +
                            'pd1.customers_id,' +
                            '$1,' +
                            'pd1.products_id,' +
                            'pd1.pricing_id,' +
                            'pd1.qty,' +
                            'pd1.price,' +
                            'pd1.gst,' +
                            'pd1.notes,' +
                            'pd1.taxcodes_id,' +
                            '$2 ' +
                            'from ' +
                            'producttemplatedetails pd1 ' +
                            'where ' +
                            'pd1.customers_id=$3 ' +
                            'and ' +
                            'pd1.producttemplateheaders_id=$4 ' +
                            'and ' +
                            'pd1.dateexpired is null ' +
                            'returning id',
                            [
                              __.sanitiseAsBigInt(r.id),
                              world.cn.userid,
                              world.cn.custid,
                              __.sanitiseAsBigInt(world.producttemplateid)
                            ],
                            function(err, result)
                            {
                              if (!err)
                                callback(null, {producttemplatedetailid: result.rows[0].id});
                              else
                                callback(err);
                            }
                          );
                        }
                        else
                          callback(err);
                      }
                    );
                  }
                );
              }
            );

            global.async.series
            (
              calls,
              function(err, results)
              {
                if (!err)
                  resolve(results);
                else
                  reject(err);
              }
            );
          }
          else
            reject(err);
        }
      );
    }
  );
  return promise;
}

function doSyncBuildTemplate(tx, world)
{
  var promise = new global.rsvp.Promise
  (
    function(resolve, reject)
    {
      tx.query
      (
        'select p1.id,p1.buildtemplateheaders_id buildttemplateid,p1.name from getchildrenofbuildtemplateheader($1,$2) p1',
        [
          world.cn.custid,
          __.sanitiseAsBigInt(world.buildtemplateid)
        ],
        function(err, result)
        {
          if (!err)
          {
            var calls = [];

            result.rows.forEach
            (
              function(r)
              {
                // For each sub-template, remove all the existing products and replace with the ones from supplied template instead...
                calls.push
                (
                  function(callback)
                  {
                    // Remove existing products for this template...
                    tx.query
                    (
                      'update buildtemplatedetails set dateexpired=now(),usersexpired_id=$1 where customers_id=$2 and buildtemplateheaders_id=$3 and dateexpired is null',
                      [
                        world.cn.userid,
                        world.cn.custid,
                        __.sanitiseAsBigInt(r.id)
                      ],
                      function(err, result)
                      {
                        if (!err)
                        {
                          // Now insert products...
                          tx.query
                          (
                            'insert into ' +
                            'buildtemplatedetails ' +
                            '(' +
                            'customers_id,' +
                            'buildtemplateheaders_id,' +
                            'products_id,' +
                            'pricing_id,' +
                            'qty,' +
                            'price,' +
                            'gst,' +
                            'notes,' +
                            'taxcodes_id,' +
                            'userscreated_id' +
                            ') ' +
                            'select ' +
                            'pd1.customers_id,' +
                            '$1,' +
                            'pd1.products_id,' +
                            'pd1.pricing_id,' +
                            'pd1.qty,' +
                            'pd1.price,' +
                            'pd1.gst,' +
                            'pd1.notes,' +
                            'pd1.taxcodes_id,' +
                            '$2 ' +
                            'from ' +
                            'buildtemplatedetails pd1 ' +
                            'where ' +
                            'pd1.customers_id=$3 ' +
                            'and ' +
                            'pd1.buildtemplateheaders_id=$4 ' +
                            'and ' +
                            'pd1.dateexpired is null ' +
                            'returning id',
                            [
                              __.sanitiseAsBigInt(r.id),
                              world.cn.userid,
                              world.cn.custid,
                              __.sanitiseAsBigInt(world.buildtemplateid)
                            ],
                            function(err, result)
                            {
                              if (!err)
                                callback(null, {buildtemplatedetailid: result.rows[0].id});
                              else
                                callback(err);
                            }
                          );
                        }
                        else
                          callback(err);
                      }
                    );
                  }
                );
              }
            );

            global.async.series
            (
              calls,
              function(err, results)
              {
                if (!err)
                  resolve(results);
                else
                  reject(err);
              }
            );
          }
          else
            reject(err);
        }
      );
    }
  );
  return promise;
}

// This only syncs when header record has pointer back to producttemplateheaders (through duplicate)... if producttemplateheaders_id is null, this won't sync it...
// TODO: Get root nodes, then first level of child nodes and get their producttemplateheaders_id and sync those - then loop to sync each subchild...
function doSyncBuildTemplatesToMasters(tx, world)
{
  var promise = new global.rsvp.Promise
  (
    function(resolve, reject)
    {
      tx.query
      (
        'select distinct bh1.producttemplateheaders_id producttemplateheaderid from buildtemplateheaders bh1 where bh1.customers_id=$1 and bh1.dateexpired is null and bh1.producttemplateheaders_id is not null',
        [
          world.cn.custid
        ],
        function(err, result)
        {
          if (!err)
          {
            var calls = [];

            result.rows.forEach
            (
              function(r)
              {
                // For each sub-template, remove all the existing products and replace with the ones from supplied template instead...
                calls.push
                (
                  function(callback)
                  {
                    // Remove existing products for this template...
                    tx.query
                    (
                      'update buildtemplatedetails set dateexpired=now(),usersexpired_id=$1 where customers_id=$2 and dateexpired is null and buildtemplateheaders_id in (select id from buildtemplateheaders where customers_id=$3 and producttemplateheaders_id=$4 and dateexpired is null)',
                      [
                        world.cn.userid,
                        world.cn.custid,
                        world.cn.custid,
                        __.sanitiseAsBigInt(r.producttemplateheaderid)
                      ],
                      function(err, result)
                      {
                        if (!err)
                        {
                          // Now insert products...
                          tx.query
                          (
                            'insert into ' +
                            'buildtemplatedetails ' +
                            '(' +
                            'customers_id,' +
                            'buildtemplateheaders_id,' +
                            'products_id,' +
                            'pricing_id,' +
                            'qty,' +
                            'price,' +
                            'gst,' +
                            'notes,' +
                            'taxcodes_id,' +
                            'userscreated_id' +
                            ') ' +
                            'select ' +
                            'pd1.customers_id,' +
                            'bth1.id,' +
                            'pd1.products_id,' +
                            'pd1.pricing_id,' +
                            'pd1.qty,' +
                            'pd1.price,' +
                            'pd1.gst,' +
                            'pd1.notes,' +
                            'pd1.taxcodes_id,' +
                            '$1 ' +
                            'from ' +
                            'producttemplatedetails pd1 left join producttemplateheaders ph1 on (pd1.producttemplateheaders_id=ph1.id) ' +
                            '                           left join buildtemplateheaders bth1 on (ph1.id=bth1.producttemplateheaders_id) ' +
                            'where ' +
                            'pd1.customers_id=$2 ' +
                            'and ' +
                            'pd1.producttemplateheaders_id=$3 ' +
                            'and ' +
                            'pd1.dateexpired is null',
                            [
                              world.cn.userid,
                              world.cn.custid,
                              __.sanitiseAsBigInt(r.producttemplateheaderid)
                            ],
                            function(err, result)
                            {
                              if (!err)
                                callback(null);
                              else
                                callback(err);
                            }
                          );
                        }
                        else
                          callback(err);
                      }
                    );
                  }
                );
              }
            );

            global.async.series
            (
              calls,
              function(err, results)
              {
                if (!err)
                  resolve(results);
                else
                  reject(err);
              }
            );
          }
          else
            reject(err);
        }
      );
    }
  );
  return promise;
}

function doSyncBuildTemplatesFromProductTemplates(tx, world) {
  return new global.rsvp.Promise(
    (resolve, reject) => {
      tx.query(
      'SELECT p1.code, p1.name, p1.taxcodes_id, p1.price, p1.gst, p1.qty ' +
      'FROM producttemplateheaders p1 ' +
      'WHERE p1.customers_id = $1 ' +
      'AND p1.id = $2 ' +
      'AND p1.dateexpired is null',
        [
          world.cn.custid,
          world.producttemplateid
        ],
        (err, result) => {
          let rowResult = result.rows[0];
          if (!err) {
            tx.query(
              'UPDATE buildtemplateheaders SET ' +
              'name=$1, code=$2, taxcodes_id=$3, gst=$4, price=$5, qty=$6, datemodified=now(), usersmodified_id=$7 '+ 
              'WHERE customers_id=$8 AND producttemplateheaders_id=$9 AND dateexpired is null',
              [
                __.sanitiseAsTrimString(rowResult.name, 50),
                __.sanitiseAsTrimString(rowResult.code, 50),
                __.sanitiseAsBigInt(rowResult.taxcodes_id),
                __.formatnumber(rowResult.gst,4),
                __.formatnumber(rowResult.price,4),
                __.formatnumber(rowResult.qty,4),
                world.cn.userid,
                world.cn.custid,
                world.producttemplateid
              ],
              (err, result) => {
                if (!err) {
                  resolve(result);
                } else {
                  reject(err);
                }
              }
            );
          } else {
            reject(err);
          }
        });
    }
  );
}


function doChangeProductCategory(tx, world)
{
  var promise = new global.rsvp.Promise
  (
    function(resolve, reject)
    {
      tx.query
      (
        'update products set productcategories_id=$1,datemodified=now(),usersmodified_id=$2 where customers_id=$3 and id=$4',
        [
          __.sanitiseAsBigInt(world.productcategoryid),
          world.cn.userid,
          world.cn.custid,
          __.sanitiseAsBigInt(world.productid)
        ],
        function(err, result)
        {
          if (!err)
          {
            tx.query
            (
              'select p1.datemodified,u1.name from products p1 left join users u1 on (p1.usersmodified_id=u1.id) where p1.customers_id=$1 and p1.id=$2',
              [
                world.cn.custid,
                __.sanitiseAsBigInt(world.productid)
              ],
              function(err, result)
              {
                if (!err)
                  resolve({datemodified: global.moment(result.rows[0].datemodified).format('YYYY-MM-DD HH:mm:ss'), usermodified: result.rows[0].name});
                else
                  reject(err);
              }
            );
          }
          else
            reject(err);
        }
      );
    }
  );
  return promise;
}

function doNewProductCategory(tx, world)
{
  var promise = new global.rsvp.Promise
  (
    function(resolve, reject)
    {
      tx.query
      (
        'insert into productcategories (customers_id,productcategories_id,name,code,userscreated_id) values ($1,$2,$3,$4,$5) returning id',
        [
          world.cn.custid,
          __.sanitiseAsBigInt(world.parentid),
          __.sanitiseAsString(world.name, 50),
          __.sanitiseAsString(world.code, 50),
          world.cn.userid
        ],
        function(err, result)
        {
          if (!err)
          {
            var productcategoryid = result.rows[0].id;

            tx.query
            (
              'select pc1.datecreated,u1.name usermodified from productcategories pc1 left join users u1 on (pc1.userscreated_id=u1.id) where pc1.customers_id=$1 and pc1.id=$2',
              [
                world.cn.custid,
                __.sanitiseAsBigInt(productcategoryid)
              ],
              function(err, result)
              {
                if (!err)
                {
                  var pc = result.rows[0];

                  resolve({productcategoryid: productcategoryid, datecreated: global.moment(pc.datecreated).format('YYYY-MM-DD HH:mm:ss'), usermodified: pc.usermodified});
                }
                else
                  reject({message: global.text_unablenewproductcategory});
              }
            );
          }
          else
            reject(err);
        }
      );
    }
  );
  return promise;
}

function doSaveProductCategory(tx, world)
{
  var promise = new global.rsvp.Promise
  (
    function(resolve, reject)
    {
      tx.query
      (
        'update productcategories set code=$1,name=$2,datemodified=now(),usersmodified_id=$3 where customers_id=$4 and id=$5 and dateexpired is null',
        [
          __.sanitiseAsString(world.code, 50),
          __.sanitiseAsString(world.name, 50),
          world.cn.userid,
          world.cn.custid,
          __.sanitiseAsBigInt(world.productcategoryid)
        ],
        function(err, result)
        {
          if (!err)
          {
            tx.query
            (
              'select pc1.datemodified,u1.name from productcategories pc1 left join users u1 on (pc1.usersmodified_id=u1.id) where pc1.customers_id=$1 and pc1.id=$2',
              [
                world.cn.custid,
                __.sanitiseAsBigInt(world.productcategoryid)
              ],
              function(err, result)
              {
                if (!err)
                  resolve({datemodified: global.moment(result.rows[0].datemodified).format('YYYY-MM-DD HH:mm:ss'), usermodified: result.rows[0].name});
                else
                  reject(err);
              }
            );
          }
          else
            reject(err);
        }
      );
    }
  );
  return promise;
}

function doChangeProductCategoryParent(tx, world)
{
  var promise = new global.rsvp.Promise
  (
    function(resolve, reject)
    {
      tx.query
      (
        'update productcategories set productcategories_id=$1,datemodified=now(),usersmodified_id=$2 where customers_id=$3 and id=$4',
        [
          __.sanitiseAsBigInt(world.parentid),
          world.cn.userid,
          world.cn.custid,
          __.sanitiseAsBigInt(world.productcategoryid)
        ],
        function(err, result)
        {
          if (!err)
          {
            tx.query
            (
              'select pc1.datemodified,u1.name from productcategories pc1 left join users u1 on (pc1.usersmodified_id=u1.id) where pc1.customers_id=$1 and pc1.id=$2',
              [
                world.cn.custid,
                __.sanitiseAsBigInt(world.productcategoryid)
              ],
              function(err, result)
              {
                if (!err)
                  resolve({datemodified: global.moment(result.rows[0].datemodified).format('YYYY-MM-DD HH:mm:ss'), usermodified: result.rows[0].name});
                else
                  reject(err);
              }
            );
          }
          else
            reject(err);
        }
      );
    }
  );
  return promise;
}

function doExpireProductCategoryStep1(tx, world)
{
  var promise = new global.rsvp.Promise
  (
    function(resolve, reject)
    {
      if (!world.cascade)
      {
        tx.query
        (
          'select p1.productcategories_id productcategoryid from productcategories p1 where p1.customers_id=$1 and p1.id=$2 and p1.dateexpired is null',
          [
            world.cn.custid,
            __.sanitiseAsBigInt(world.productcategoryid)
          ],
          function(err, result)
          {
            if (!err)
            {
              if (result.rows.length == 1)
              {
                var parentid = result.rows[0].productcategoryid;

                tx.query
                (
                  'update productcategories set productcategories_id=$1,datemodified=now(),usersmodified_id=$2 where customers_id=$3 and productcategories_id=$4 and dateexpired is null',
                  [
                    parentid,
                    world.cn.userid,
                    world.cn.custid,
                    __.sanitiseAsBigInt(world.productcategoryid)
                  ],
                  function(err, result)
                  {
                    if (!err)
                      resolve({productcategoryid: world.productcategoryid});
                    else
                      reject(err);
                  }
                );
              }
              else
                reject({message: global.text_unableexpireprodcat});
            }
            else
              reject(err);
          }
        );
      }
      else
        resolve({productcategoryid: world.productcategoryid});
    }
  );
  return promise;
}

function doExpireProductCategoryStep2(tx, world)
{
  var promise = new global.rsvp.Promise
  (
    function(resolve, reject)
    {
      tx.query
      (
        'update productcategories set dateexpired=now(),usersexpired_id=$1 where customers_id=$2 and id=$3 and dateexpired is null',
        [
          world.cn.userid,
          world.cn.custid,
          __.sanitiseAsBigInt(world.productcategoryid)
        ],
        function(err, result)
        {
          if (!err)
          {
            tx.query
            (
              'select p1.dateexpired,u1.name from productcategories p1 left join users u1 on (p1.usersexpired_id=u1.id) where p1.customers_id=$1 and p1.id=$2',
              [
                world.cn.custid,
                __.sanitiseAsBigInt(world.productcategoryid)
              ],
              function(err, result)
              {
                if (!err)
                  resolve({dateexpired: global.moment(result.rows[0].dateexpired).format('YYYY-MM-DD HH:mm:ss'), userexpired: result.rows[0].name});
                else
                  reject(err);
              }
            );
          }
          else
            reject(err);
        }
      );
    }
  );
  return promise;
}

function doNewProductPricing(tx, world)
{
  var promise = new global.rsvp.Promise
  (
    function(resolve, reject)
    {
      tx.query
      (
        'insert into pricing (customers_id,products_id,userscreated_id) values ($1,$2,$3) returning id',
        [
          world.cn.custid,
          __.sanitiseAsBigInt(world.productid),
          world.cn.userid
        ],
        function(err, result)
        {
          if (!err)
          {
            var priceid = result.rows[0].id;

            tx.query
            (
              'select p1.datecreated,u1.name usercreated from pricing p1 left join users u1 on (p1.userscreated_id=u1.id) where p1.customers_id=$1 and p1.id=$2',
              [
                world.cn.custid,
                __.sanitiseAsBigInt(priceid)
              ],
              function(err, result)
              {
                if (!err)
                {
                  var p = result.rows[0];

                  resolve
                  (
                    {
                      priceid: priceid,
                      datecreated: global.moment(p.datecreated).format('YYYY-MM-DD HH:mm:ss'),
                      usercreated: p.usercreated
                    }
                  );
                }
                else
                  reject({message: global.text_unablenewproductprice});
              }
            );
          }
          else
            reject(err);
        }
      );
    }
  );
  return promise;
}

/*

'update buildtemplateheaders set code=$1,name=$2,clients_id=$3,taxcodes_id=$4,price=$5,gst=calctaxcomponent($6,$7,$8),qty=$9,datemodified=now(),usersmodified_id=$10 where customers_id=$11 and id=$12',
  [
    __.sanitiseAsString(world.code, 50),
    __.sanitiseAsString(world.name, 50),
    __.sanitiseAsBigInt(world.clientid),
    __.sanitiseAsBigInt(world.taxcodeid),
    __.sanitiseAsPrice(world.price, 4),
    //
    world.cn.custid,
    __.sanitiseAsPrice(world.price, 4),
    __.sanitiseAsBigInt(world.taxcodeid),
*/

function doSaveProductPricing(tx, world)
{
  var promise = new global.rsvp.Promise
  (
    function(resolve, reject)
    {
      // global.ConsoleLog("world.datefrom");
      // global.ConsoleLog(world.datefrom);
      // global.ConsoleLog(typeof world.datefrom);
      // global.ConsoleLog(__.sanitiseAsDate(world.datefrom));
      // global.ConsoleLog(typeof __.sanitiseAsDate(world.datefrom));
      tx.query
      (
        "update pricing set clients_id=$1,minqty=$2,maxqty=$3,price=$4,price1=$5,price2=$6,price3=$7,price4=$8,price5=$9,datemodified=now(),usersmodified_id=$10,datefrom = TO_TIMESTAMP($13,'YYYY-MM-DD HH24:MI:SS')::timestamp without time zone,dateto=TO_TIMESTAMP($14,'YYYY-MM-DD HH24:MI:SS')::timestamp without time zone where customers_id=$11 and id=$12 and dateexpired is null",
        [
          __.sanitiseAsBigInt(world.clientid),
          __.sanitiseAsPrice(world.minqty, 4),
          __.sanitiseAsPrice(world.maxqty, 4),
          __.sanitiseAsPrice(world.price, 4),
          __.sanitiseAsPrice(world.price1, 4),
          __.sanitiseAsPrice(world.price2, 4),
          __.sanitiseAsPrice(world.price3, 4),
          __.sanitiseAsPrice(world.price4, 4),
          __.sanitiseAsPrice(world.price5, 4),
          world.cn.userid,
          world.cn.custid,
          __.sanitiseAsBigInt(world.priceid),
          __.sanitiseAsDate(world.datefrom),
          __.sanitiseAsDate(world.dateto)
        ],
        function(err, result)
        {
          if (!err)
          {
            tx.query
            (
              'select p1.products_id productid,p1.datemodified,u1.name from pricing p1 left join users u1 on (p1.usersmodified_id=u1.id) where p1.customers_id=$1 and p1.id=$2',
              [
                world.cn.custid,
                __.sanitiseAsBigInt(world.priceid)
              ],
              function(err, result)
              {
                if (!err)
                  resolve({productid: result.rows[0].productid, datemodified: global.moment(result.rows[0].datemodified).format('YYYY-MM-DD HH:mm:ss'), usermodified: result.rows[0].name});
                else
                  reject(err);
              }
            );
          }
          else
          {
            global.ConsoleLog(err);
            reject(err);
          }
            
        }
      );
    }
  );
  return promise;
}

function doExpireProductPricing(tx, world)
{
  var promise = new global.rsvp.Promise
  (
    function(resolve, reject)
    {
      tx.query
      (
        'update pricing set dateexpired=now(),usersexpired_id=$1 where customers_id=$2 and id=$3 and dateexpired is null',
        [
          world.cn.userid,
          world.cn.custid,
          __.sanitiseAsBigInt(world.priceid)
        ],
        function(err, result)
        {
          if (!err)
          {
            tx.query
            (
              'select p1.products_id productid,p1.dateexpired,u1.name from pricing p1 left join users u1 on (p1.usersexpired_id=u1.id) where p1.customers_id=$1 and p1.id=$2',
              [
                world.cn.custid,
                __.sanitiseAsBigInt(world.priceid)
              ],
              function(err, result)
              {
                if (!err)
                  resolve({productid: result.rows[0].productid, dateexpired: global.moment(result.rows[0].dateexpired).format('YYYY-MM-DD HH:mm:ss'), userexpired: result.rows[0].name});
                else
                  reject(err);
              }
            );
          }
          else
            reject(err);
        }
      );
    }
  );
  return promise;
}

function doNewBuildTemplateStep1(tx, custid, userid, code, clientid)
{
  var promise = new global.rsvp.Promise
  (
    function(resolve, reject)
    {
      // Check if this build template exists for this code already...
      tx.query
      (
        'select bth1.id,bth1.datecreated,u1.name usesrcreated from buildtemplateheaders bth1 left join users u1 on (bth1.userscreated_id=u1.id) where bth1.customers_id=$1 and bth1.buildtemplateheaders_id is null and bth1.code=$2 and bth1.dateexpired is null',
        [
          custid,
          __.sanitiseAsString(code)
        ],
        function(err, result)
        {
          if (!err)
          {
            if (result.rows.length > 0)
              resolve({buildtemplateid: result.rows[0].id, datecreated: result.rows[0].datecreated, usercreated: result.rows[0].usercreated});
            else
            {
              // If we have a clientid, find their name...
              tx.query
              (
                'select c1.name from clients c1 where c1.customers_id=$1 and c1.id=$2',
                [
                  custid,
                  __.sanitiseAsBigInt(clientid)
                ],
                function(err, result)
                {
                  if (!err)
                  {
                    var name = (result.rows.length > 0) ? result.rows[0].name : code;

                    tx.query
                    (
                      'insert into buildtemplateheaders (customers_id,buildtemplateheaders_id,clients_id,code,name,userscreated_id) values ($1,null,$2,$3,$4,$5) returning id',
                      [
                        custid,
                        __.sanitiseAsBigInt(clientid),
                        __.sanitiseAsString(code),
                        __.sanitiseAsString(name),
                        userid
                      ],
                      function(err, result)
                      {
                        if (!err)
                        {
                          var id = result.rows[0].id;

                          tx.query
                          (
                            'select bth1.datecreated,u1.name usesrcreated from buildtemplateheaders bth1 left join users u1 on (bth1.userscreated_id=u1.id) where bth1.customers_id=$1 and bth1.id=$2',
                            [
                              custid,
                              id
                            ],
                            function(err, result)
                            {
                              if (!err)
                                resolve({buildtemplateid: id, datecreated: result.rows[0].datecreated, usercreated: result.rows[0].usercreated});
                              else
                                reject(err);
                            }
                          );
                        }
                        else
                          reject(err);
                      }
                    );
                  }
                  else
                    reject(err);
                }
              );
            }
          }
          else
            reject(err);
        }
      );
    }
  );
  return promise;
}

function doNewBuildTemplateStep2(tx, custid, userid, code, clientid, buildtemplateid, templates)
{
  var promise = new global.rsvp.Promise
  (
    function(resolve, reject)
    {
      tx.query
      (
        'select p1.datecreated,u1.name usercreated from buildtemplateheaders p1 left join users u1 on (p1.userscreated_id=u1.id) where p1.customers_id=$1 and p1.id=$2',
        [
          custid,
          __.sanitiseAsBigInt(buildtemplateid)
        ],
        function(err, result)
        {
          if (!err)
          {
            var datecreated = global.moment(result.rows[0].datecreated).format('YYYY-MM-DD HH:mm:ss');
            var usercreated = result.rows[0].usercreated;

            // Special case for root template, copy all master product templates...
            var calls = [];

            // For each template selected, we'll load it's details, especially path
            // as we need to know how to get to it...
            // So e.g., SW02 might be /169/131/ so it has two parents - we need to recreate that path...
            templates.forEach
            (
              function(t)
              {
                calls.push
                (
                  function(callback)
                  {
                    tx.query
                    (
                      'select pth1.id,pth1.path,pth1.code,pth1.name,pth1.price,pth1.gst,pth1.qty,pth1.totalprice,pth1.totalgst,pth1.taxcodes_id from producttemplateheaders pth1 where pth1.customers_id=$1 and pth1.id=$2 and pth1.dateexpired is null',
                      [
                        custid,
                        __.sanitiseAsBigInt(t)
                      ],
                      function(err, result)
                      {
                        if (!err)
                        {
                          var nodeid = result.rows[0].id;
                          var nodepath = result.rows[0].path;
                          var nodecode = result.rows[0].code;
                          var nodename = result.rows[0].name;
                          var nodeprice = result.rows[0].price;
                          var nodegst = result.rows[0].gst;
                          var nodeqty = result.rows[0].qty;
                          var nodetotalprice = result.rows[0].totalprice;
                          var nodetotalgst = result.rows[0].totalgst;
                          var nodetaxcodes_id = result.rows[0].taxcodes_id;

                          // Remove first and last slash which are the root and last parent indicators
                          nodepath = nodepath.substr(1, nodepath.length - 1);
                          if ((nodepath.length > 0) && (nodepath[nodepath.length - 1] == '/'))
                            nodepath = nodepath.substr(0, nodepath.length - 1);

                          var parentids = nodepath.split('/');
                          var currentparentid = buildtemplateid;

                          // We should now have an array of all parent nodes
                          // Now we recreate the same path structure
                          // 1. Get the code/name of this node from original product template headers table
                          // 2. Insert as new node with parent of our just created buildtemplateid
                          // 3. Make this node parent for next node or we're done and can then insert the template details...

                          var calls2 = [];

                          parentids.forEach
                          (
                            function(p)
                            {
                              calls2.push
                              (
                                function(callback2)
                                {
                                  if (__.isBlank(p))
                                  {
                                    // Root node
                                    callback2(null, null);
                                    return;
                                  }

                                  tx.query
                                  (
                                    'select pth1.code,pth1.name from producttemplateheaders pth1 where pth1.customers_id=$1 and pth1.id=$2',
                                    [
                                      custid,
                                      __.sanitiseAsBigInt(p)
                                    ],
                                    function(err, result)
                                    {
                                      if (!err)
                                      {
                                        var pcode = result.rows[0].code;
                                        var pname = result.rows[0].name;

                                        // See if we already have this node...
                                        tx.query
                                        (
                                          'select bth1.id from buildtemplateheaders bth1 where bth1.customers_id=$1 and bth1.buildtemplateheaders_id=$2 and bth1.code=$3 and bth1.dateexpired is null',
                                          [
                                            custid,
                                            __.sanitiseAsBigInt(currentparentid),
                                            pcode
                                          ],
                                          function(err, result)
                                          {
                                            if (!err)
                                            {
                                              // Aready exists?
                                              if (result.rows.length > 0)
                                              {
                                                currentparentid = result.rows[0].id;

                                                callback2(null, currentparentid);
                                              }
                                              else
                                              {
                                                // Now create the next node...
                                                tx.query
                                                (
                                                  'insert into buildtemplateheaders (customers_id,buildtemplateheaders_id,clients_id,code,name,userscreated_id) values ($1,$2,$3,$4,$5,$6) returning id',
                                                  [
                                                    custid,
                                                    __.sanitiseAsBigInt(currentparentid),
                                                    __.sanitiseAsBigInt(clientid),
                                                    pcode,
                                                    pname,
                                                    userid
                                                  ],
                                                  function(err, result)
                                                  {
                                                    if (!err)
                                                    {
                                                      currentparentid = result.rows[0].id;

                                                      callback2(null, currentparentid);
                                                    }
                                                    else
                                                      callback2(err);
                                                  }
                                                );
                                              }
                                            }
                                            else
                                              callback(err);
                                          }
                                        );
                                      }
                                      else
                                        callback2(err);
                                    }
                                  );
                                }
                              );
                            }
                          );

                          global.async.series
                          (
                            calls2,
                            function(err, results)
                            {
                              if (!err)
                              {
                                // Ok, got this far, we've got client as "root" node, then all the parent nodes (if any) to where we are now - nodecode/nodename...
                                // Note that nodecode/nodename might not contain any details...
                                tx.query
                                (
                                  'insert into buildtemplateheaders (customers_id,buildtemplateheaders_id,clients_id,code,name,price,gst,qty,totalprice,totalgst,taxcodes_id,userscreated_id) values ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12) returning id',
                                  [
                                    custid,
                                    __.sanitiseAsBigInt(currentparentid),
                                    __.sanitiseAsBigInt(clientid),
                                    nodecode,
                                    nodename,
                                    nodeprice,
                                    nodegst,
                                    nodeqty,
                                    nodetotalprice,
                                    nodetotalgst,
                                    nodetaxcodes_id,
                                    userid
                                  ],
                                  function(err, result)
                                  {
                                    if (!err)
                                    {
                                      var id = result.rows[0].id;

                                      tx.query
                                      (
                                        'insert into ' +
                                        'buildtemplatedetails ' +
                                        '(' +
                                        'customers_id,' +
                                        'buildtemplateheaders_id,' +
                                        'products_id,' +
                                        'pricing_id,' +
                                        'qty,' +
                                        'price,' +
                                        'gst,' +
                                        'notes,' +
                                        'taxcodes_id,' +
                                        'pertemplateqty,' +
                                        'userscreated_id' +
                                        ') ' +
                                        'select ' +
                                        '$1,' +
                                        '$2,' +
                                        'products_id,' +
                                        'pricing_id,' +
                                        'qty,' +
                                        'price,' +
                                        'gst,' +
                                        'notes,' +
                                        'taxcodes_id,' +
                                        'pertemplateqty,' +
                                        '$3 ' +
                                        'from ' +
                                        'producttemplatedetails ' +
                                        'where ' +
                                        'producttemplateheaders_id=$4 ' +
                                        'and ' +
                                        'customers_id=$5 ' +
                                        'and ' +
                                        'dateexpired is null ' +
                                        'returning id',
                                        [
                                          custid,
                                          id,
                                          userid,
                                          __.sanitiseAsBigInt(t),
                                          custid
                                        ],
                                        function(err, result)
                                        {
                                          if (!err)
                                          {
                                            // Template may not have any details...
                                            callback(null, {buildtemplatedetailid: (result.rows.length > 0) ? result.rows[0].id : null});
                                          }
                                          else
                                            callback(err);
                                        }
                                      );

                                    }
                                    else
                                      callback(err);
                                  }
                                );
                              }
                              else
                                callback(err);
                            }
                          );
                        }
                        else
                          callback(err);
                      }
                    );
                  }
                );
              }
            );

            global.async.series
            (
              calls,
              function(err, results)
              {
                if (!err)
                  resolve(results);
                else
                  reject(err);
              }
            );
          }
          else
            reject({message: global.text_unablenewproducttemplate});
        }
      );
    }
  );
  return promise;
}

function doNewProductTemplate(tx, world)
{
  var promise = new global.rsvp.Promise
  (
    function(resolve, reject)
    {
      tx.query
      (
        'insert into producttemplateheaders (customers_id,producttemplateheaders_id,code,name,userscreated_id) values ($1,$2,$3,$4,$5) returning id',
        [
          world.cn.custid,
          __.sanitiseAsBigInt(world.parentid),
          __.sanitiseAsString(world.newcode, 50),
          __.sanitiseAsString(world.name, 50),
          world.cn.userid
        ],
        function(err, result)
        {
          if (!err)
          {
            var producttemplateid = result.rows[0].id;

            tx.query
            (
              'select p1.datecreated,u1.name usercreated from producttemplateheaders p1 left join users u1 on (p1.userscreated_id=u1.id) where p1.customers_id=$1 and p1.id=$2',
              [
                world.cn.custid,
                __.sanitiseAsBigInt(producttemplateid)
              ],
              function(err, result)
              {
                if (!err)
                {
                  var t = result.rows[0];

                  resolve
                  (
                    {
                      producttemplateid: producttemplateid,
                      datecreated: global.moment(t.datecreated).format('YYYY-MM-DD HH:mm:ss'),
                      usercreated: t.usercreated
                    }
                  );
                }
                else
                  reject({message: global.text_unablenewproducttemplate});
              }
            );
          }
          else
            reject(err);
        }
      );
    }
  );
  return promise;
}

function doSaveBuildTemplate(tx, world)
{
  var promise = new global.rsvp.Promise
  (
    function(resolve, reject)
    {
      tx.query
      (
        'update buildtemplateheaders set code=$1,name=$2,clients_id=$3,taxcodes_id=$4,price=$5,gst=calctaxcomponent($6,$7,$8),qty=$9,datemodified=now(),usersmodified_id=$10 where customers_id=$11 and id=$12',
        [
          __.sanitiseAsString(world.code, 50),
          __.sanitiseAsString(world.name, 50),
          __.sanitiseAsBigInt(world.clientid),
          __.sanitiseAsBigInt(world.taxcodeid),
          __.sanitiseAsPrice(world.price, 4),
          //
          world.cn.custid,
          __.sanitiseAsPrice(world.price, 4),
          __.sanitiseAsBigInt(world.taxcodeid),
          //
          __.sanitiseAsPrice(world.qty, 4),
          world.cn.userid,
          world.cn.custid,
          __.sanitiseAsBigInt(world.buildtemplateid)
        ],
        function(err, result)
        {
          if (!err)
          {
            tx.query
            (
              'select p1.datemodified,u1.name from buildtemplateheaders p1 left join users u1 on (p1.usersmodified_id=u1.id) where p1.customers_id=$1 and p1.id=$2',
              [
                world.cn.custid,
                __.sanitiseAsBigInt(world.buildtemplateid)
              ],
              function(err, result)
              {
                if (!err)
                  resolve({datemodified: global.moment(result.rows[0].datemodified).format('YYYY-MM-DD HH:mm:ss'), usermodified: result.rows[0].name});
                else
                  reject(err);
              }
            );
          }
          else
            reject(err);
        }
      );
    }
  );
  return promise;
}

function doSaveProductTemplate(tx, world)
{
  var promise = new global.rsvp.Promise
  (
    function(resolve, reject)
    {
      tx.query
      (
        'update producttemplateheaders set code=$1,name=$2,clients_id=$3,taxcodes_id=$4,price=$5,gst=calctaxcomponent($6,$7,$8),qty=$9,datemodified=now(),usersmodified_id=$10 where customers_id=$11 and id=$12',
        [
          __.sanitiseAsString(world.code, 50),
          __.sanitiseAsString(world.name, 50),
          __.sanitiseAsBigInt(world.clientid),
          __.sanitiseAsBigInt(world.taxcodeid),
          __.sanitiseAsPrice(world.price, 4),
          //
          world.cn.custid,
          __.sanitiseAsPrice(world.price, 4),
          __.sanitiseAsBigInt(world.taxcodeid),
          //
          __.sanitiseAsPrice(world.qty, 4),
          world.cn.userid,
          world.cn.custid,
          __.sanitiseAsBigInt(world.producttemplateid)
        ],
        function(err, result)
        {
          if (!err)
          {
            tx.query
            (
              'select p1.datemodified,u1.name from producttemplateheaders p1 left join users u1 on (p1.usersmodified_id=u1.id) where p1.customers_id=$1 and p1.id=$2',
              [
                world.cn.custid,
                __.sanitiseAsBigInt(world.producttemplateid)
              ],
              function(err, result)
              {
                if (!err)
                  resolve({datemodified: global.moment(result.rows[0].datemodified).format('YYYY-MM-DD HH:mm:ss'), usermodified: result.rows[0].name});
                else
                  reject(err);
              }
            );
          }
          else
            reject(err);
        }
      );
    }
  );
  return promise;
}

function doChangeProductTemplateParent(tx, world)
{
  var promise = new global.rsvp.Promise
  (
    function(resolve, reject)
    {
      tx.query
      (
        'update producttemplateheaders set producttemplateheaders_id=$1,datemodified=now(),usersmodified_id=$2 where customers_id=$3 and id=$4',
        [
          __.sanitiseAsBigInt(world.parentid),
          world.cn.userid,
          world.cn.custid,
          __.sanitiseAsBigInt(world.producttemplateid)
        ],
        function(err, result)
        {
          if (!err)
          {
            tx.query
            (
              'select p1.datemodified,u1.name from producttemplateheaders p1 left join users u1 on (p1.usersmodified_id=u1.id) where p1.customers_id=$1 and p1.id=$2',
              [
                world.cn.custid,
                __.sanitiseAsBigInt(world.producttemplateid)
              ],
              function(err, result)
              {
                if (!err)
                  resolve({datemodified: global.moment(result.rows[0].datemodified).format('YYYY-MM-DD HH:mm:ss'), usermodified: result.rows[0].name});
                else
                  reject(err);
              }
            );
          }
          else
            reject(err);
        }
      );
    }
  );
  return promise;
}

function doChangeBuildTemplateParent(tx, world)
{
  var promise = new global.rsvp.Promise
  (
    function(resolve, reject)
    {
      tx.query
      (
        'update buildtemplateheaders set buildtemplateheaders_id=$1,datemodified=now(),usersmodified_id=$2 where customers_id=$3 and id=$4',
        [
          __.sanitiseAsBigInt(world.parentid),
          world.cn.userid,
          world.cn.custid,
          __.sanitiseAsBigInt(world.buildtemplateid)
        ],
        function(err, result)
        {
          if (!err)
          {
            tx.query
            (
              'select p1.datemodified,u1.name from buildtemplateheaders p1 left join users u1 on (p1.usersmodified_id=u1.id) where p1.customers_id=$1 and p1.id=$2',
              [
                world.cn.custid,
                __.sanitiseAsBigInt(world.buildtemplateid)
              ],
              function(err, result)
              {
                if (!err)
                  resolve({datemodified: global.moment(result.rows[0].datemodified).format('YYYY-MM-DD HH:mm:ss'), usermodified: result.rows[0].name});
                else
                  reject(err);
              }
            );
          }
          else
            reject(err);
        }
      );
    }
  );
  return promise;
}

function doExpireProductTemplateStep1(tx, world)
{
  var promise = new global.rsvp.Promise
  (
    function(resolve, reject)
    {
      if (!world.cascade)
      {
        tx.query
        (
          'select p1.producttemplateheaders_id producttemplateid from producttemplateheaders p1 where p1.customers_id=$1 and p1.id=$2 and p1.dateexpired is null',
          [
            world.cn.custid,
            __.sanitiseAsBigInt(world.producttemplateid)
          ],
          function(err, result)
          {
            if (!err)
            {
              if (result.rows.length == 1)
              {
                var parentid = result.rows[0].producttemplateid;

                tx.query
                (
                  'update producttemplateheaders set producttemplateheaders_id=$1,datemodified=now(),usersmodified_id=$2 where customers_id=$3 and producttemplateheaders_id=$4 and dateexpired is null',
                  [
                    parentid,
                    world.cn.userid,
                    world.cn.custid,
                    __.sanitiseAsBigInt(world.producttemplateid)
                  ],
                  function(err, result)
                  {
                    if (!err)
                      resolve({producttemplateid: world.producttemplateid});
                    else
                      reject(err);
                  }
                );
              }
              else
                reject({message: global.text_unableexpireproducttemplate});
            }
            else
              reject(err);
          }
        );
      }
      else
        resolve({producttemplateid: world.producttemplateid});
    }
  );
  return promise;
}

function doExpireProductTemplateStep2(tx, world)
{
  var promise = new global.rsvp.Promise
  (
    function(resolve, reject)
    {
      tx.query
      (
        'update producttemplateheaders set dateexpired=now(),usersexpired_id=$1 where customers_id=$2 and id=$3 and dateexpired is null',
        [
          world.cn.userid,
          world.cn.custid,
          world.producttemplateid
        ],
        function(err, result)
        {
          if (!err)
          {
            tx.query
            (
              'select p1.dateexpired,u1.name from producttemplateheaders p1 left join users u1 on (p1.usersexpired_id=u1.id) where p1.customers_id=$1 and p1.id=$2',
              [
                world.cn.custid,
                __.sanitiseAsBigInt(world.producttemplateid)
              ],
              function(err, result)
              {
                if (!err)
                  resolve({dateexpired: global.moment(result.rows[0].dateexpired).format('YYYY-MM-DD HH:mm:ss'), userexpired: result.rows[0].name});
                else
                  reject(err);
              }
            );
          }
          else
            reject(err);
        }
      );
    }
  );
  return promise;
}

function doExpireBuildTemplateStep1(tx, world)
{
  var promise = new global.rsvp.Promise
  (
    function(resolve, reject)
    {
      if (!world.cascade)
      {
        tx.query
        (
          'select p1.buildtemplateheaders_id buildtemplateid from buildtemplateheaders p1 where p1.customers_id=$1 and p1.id=$2 and p1.dateexpired is null',
          [
            world.cn.custid,
            __.sanitiseAsBigInt(world.buildtemplateid)
          ],
          function(err, result)
          {
            if (!err)
            {
              if (result.rows.length == 1)
              {
                var parentid = result.rows[0].buildtemplateid;

                tx.query
                (
                  'update buildtemplateheaders set buildtemplateheaders_id=$1,datemodified=now(),usersmodified_id=$2 where customers_id=$3 and buildtemplateheaders_id=$4 and dateexpired is null',
                  [
                    parentid,
                    world.cn.userid,
                    world.cn.custid,
                    __.sanitiseAsBigInt(world.buildtemplateid)
                  ],
                  function(err, result)
                  {
                    if (!err)
                      resolve({producttemplateid: world.buildtemplateid});
                    else
                      reject(err);
                  }
                );
              }
              else
                reject({message: global.text_unableexpirebuildtemplate});
            }
            else
              reject(err);
          }
        );
      }
      else
        resolve({buildtemplateid: world.buildtemplateid});
    }
  );
  return promise;
}

function doExpireBuildTemplateStep2(tx, world)
{
  var promise = new global.rsvp.Promise
  (
    function(resolve, reject)
    {
      tx.query
      (
        'update buildtemplateheaders set dateexpired=now(),usersexpired_id=$1 where customers_id=$2 and id=$3 and dateexpired is null',
        [
          world.cn.userid,
          world.cn.custid,
          world.buildtemplateid
        ],
        function(err, result)
        {
          if (!err)
          {
            tx.query
            (
              'select p1.dateexpired,u1.name from buildtemplateheaders p1 left join users u1 on (p1.usersexpired_id=u1.id) where p1.customers_id=$1 and p1.id=$2',
              [
                world.cn.custid,
                __.sanitiseAsBigInt(world.buildtemplateid)
              ],
              function(err, result)
              {
                if (!err)
                  resolve({dateexpired: global.moment(result.rows[0].dateexpired).format('YYYY-MM-DD HH:mm:ss'), userexpired: result.rows[0].name});
                else
                  reject(err);
              }
            );
          }
          else
            reject(err);
        }
      );
    }
  );
  return promise;
}

function doDuplicateProductTemplate(tx, world)
{
  var promise = new global.rsvp.Promise
  (
    function(resolve, reject)
    {
      // Find parent of this template if any, so we can duplicate into same level...
      tx.query
      (
        'select ' +
        'p1.producttemplateheaders_id parentid ' +
        'from ' +
        'producttemplateheaders p1 ' +
        'where ' +
        'p1.customers_id=$1 ' +
        'and ' +
        'p1.id=$2',
        [
          world.cn.custid,
          __.sanitiseAsBigInt(world.producttemplateid)
        ],
        function(err, result)
        {
          if (!err && (result.rows.length == 1))
          {
            var originalparentid = result.rows[0].parentid;

            tx.query
            (
              'select ' +
              'g1.id,' +
              'g1.producttemplateheaders_id parentid ' +
              'from ' +
              'getchildrenofproducttemplateheader($1,$2) g1',
              [
                world.cn.custid,
                __.sanitiseAsBigInt(world.producttemplateid)
              ],
              function(err, result)
              {
                if (!err)
                {
                  var rows = result.rows;
                  var calls = [];
                  // Map of IDs that maps original ID to the newly created one we can use as parent ID for child nodes
                  // So, idmap[100] = 200 means ID used to be 100 and is now 200 so any nodes that used to be child of
                  // 100 can now wbe updated to point to new parent of 200....
                  var idmap = {};

                  // Query only returns children of the template we want to duplicate...
                  // We need to duplicate this template entry itself as well...
                  // So we add this template and it's original parent (if any) to the loop...
                  rows.unshift({id: world.producttemplateid, parentid: originalparentid});
                  idmap[originalparentid] = originalparentid;

                  rows.forEach
                  (
                    function(t)
                    {
                      calls.push
                      (
                        function(callback)
                        {
                          var newparentid = null;

                          // If we have a parent, then look for it in mapping array and see if we can find its new ID...
                          if (!__.isNull(t.parentid))
                          {
                            if (!__.isUndefined(idmap[t.parentid]))
                              newparentid = idmap[t.parentid];
                          }
                          // Now we can duplicate this whole thing
                          // Don't forget to add new ID to map array when we're done...
                          tx.query
                          (
                            'insert into ' +
                            'producttemplateheaders ' +
                            '(' +
                            'customers_id,' +
                            'producttemplateheaders_id,' +
                            'clients_id,' +
                            'code,' +
                            'name,' +
                            'price,' +
                            'gst,' +
                            'qty,' +
                            'taxcodes_id,' +
                            'notes,' +
                            'userscreated_id' +
                            ') ' +
                            'select ' +
                            'p1.customers_id,' +
                            '$1,' +
                            'p1.clients_id,' +
                            'p1.code || \'_\' || $2,' +
                            'p1.name || \' copy\',' +
                            'p1.price,' +
                            'p1.gst,' +
                            'p1.qty,' +
                            'p1.taxcodes_id,' +
                            'p1.notes,' +
                            '$3 ' +
                            'from ' +
                            'producttemplateheaders p1 ' +
                            'where ' +
                            'p1.customers_id=$4 ' +
                            'and ' +
                            'p1.id=$5 ' +
                            'returning id',
                            [
                              newparentid,
                              __.sanitiseAsString(world.newcode),
                              world.cn.userid,
                              world.cn.custid,
                              t.id
                            ],
                            function(err, result)
                            {
                              if (!err)
                              {
                                var newproducttemplateid = result.rows[0].id;
                                //
                                idmap[t.id] = newproducttemplateid;
                                //
                                tx.query
                                (
                                  'insert into ' +
                                  'producttemplatedetails ' +
                                  '(' +
                                  'customers_id,' +
                                  'producttemplateheaders_id,' +
                                  'products_id,' +
                                  'pricing_id,' +
                                  'qty,' +
                                  'price,' +
                                  'gst,' +
                                  'taxcodes_id,' +
                                  'pertemplateqty,' +
                                  'notes,' +
                                  'userscreated_id' +
                                  ') ' +
                                  'select ' +
                                  'p1.customers_id,' +
                                  '$1,' +
                                  'p1.products_id,' +
                                  'p1.pricing_id,' +
                                  'p1.qty,' +
                                  'p1.price,' +
                                  'p1.gst,' +
                                  'p1.taxcodes_id,' +
                                  'p1.pertemplateqty,' +
                                  'p1.notes,' +
                                  '$2 ' +
                                  'from ' +
                                  'producttemplatedetails p1 ' +
                                  'where ' +
                                  'p1.customers_id=$3 ' +
                                  'and ' +
                                  'p1.producttemplateheaders_id=$4 ' +
                                  'and ' +
                                  'p1.dateexpired is null ' +
                                  'order by ' +
                                  'p1.id',
                                  [
                                    newproducttemplateid,
                                    world.cn.userid,
                                    world.cn.custid,
                                    t.id
                                  ],
                                  function(err, result)
                                  {
                                    if (!err)
                                      callback(null, newproducttemplateid);
                                    else
                                      callback(err);
                                  }
                                );
                              }
                              else
                                callback(err);
                            }
                          );
                        }
                      );
                    }
                  );

                  global.async.series
                  (
                    calls,
                    function(err, results)
                    {
                      if (!err)
                        resolve(results[0]);
                      else
                        reject(err);
                    }
                  );
                }
                else
                  reject(err);
              }
            );
          }
          else
            reject(err);
        }
      );
    }
  );
  return promise;
}

function doDuplicateBuildTemplate(tx, world)
{
  var promise = new global.rsvp.Promise
  (
    function(resolve, reject)
    {
      // Find parent of this template if any, so we can duplicate into same level...
      tx.query
      (
        'select ' +
        'p1.buildtemplateheaders_id parentid ' +
        'from ' +
        'buildtemplateheaders p1 ' +
        'where ' +
        'p1.customers_id=$1 ' +
        'and ' +
        'p1.id=$2',
        [
          world.cn.custid,
          __.sanitiseAsBigInt(world.buildtemplateid)
        ],
        function(err, result)
        {
          if (!err && (result.rows.length == 1))
          {
            var originalparentid = result.rows[0].parentid;

            tx.query
            (
              'select ' +
              'g1.id,' +
              'g1.buildtemplateheaders_id parentid ' +
              'from ' +
              'getchildrenofbuildtemplateheader($1,$2) g1',
              [
                world.cn.custid,
                __.sanitiseAsBigInt(world.buildtemplateid)
              ],
              function(err, result)
              {
                if (!err)
                {
                  var rows = result.rows;
                  var calls = [];
                  // Map of IDs that maps original ID to the newly created one we can use as parent ID for child nodes
                  // So, idmap[100] = 200 means ID used to be 100 and is now 200 so any nodes that used to be child of
                  // 100 can now wbe updated to point to new parent of 200....
                  var idmap = {};

                  // Query only returns children of the template we want to duplicate...
                  // We need to duplicate this template entry itself as well...
                  // So we add this template and it's original parent (if any) to the loop...
                  rows.unshift({id: world.buildtemplateid, parentid: originalparentid});
                  idmap[originalparentid] = originalparentid;

                  rows.forEach
                  (
                    function(t)
                    {
                      calls.push
                      (
                        function(callback)
                        {
                          var newparentid = null;

                          // If we have a parent, then look for it in mapping array and see if we can find its new ID...
                          if (!__.isNull(t.parentid))
                          {
                            if (!__.isUndefined(idmap[t.parentid]))
                              newparentid = idmap[t.parentid];
                          }
                          // Now we can duplicate this whole thing
                          // Don't forget to add new ID to map array when we're done...
                          tx.query
                          (
                            'insert into ' +
                            'buildtemplateheaders ' +
                            '(' +
                            'customers_id,' +
                            'buildtemplateheaders_id,' +
                            'producttemplateheaders_id,' +
                            'clients_id,' +
                            'code,' +
                            'name,' +
                            'price,' +
                            'gst,' +
                            'qty,' +
                            'taxcodes_id,' +
                            'notes,' +
                            'userscreated_id' +
                            ') ' +
                            'select ' +
                            'p1.customers_id,' +
                            '$1,' +
                            'p1.producttemplateheaders_id,' +
                            'p1.clients_id,' +
                            '$2 || \'_\' || p1.code,' +
                            'p1.name || \' copy\',' +
                            'p1.price,' +
                            'p1.gst,' +
                            'p1.qty,' +
                            'p1.taxcodes_id,' +
                            'p1.notes,' +
                            '$3 ' +
                            'from ' +
                            'buildtemplateheaders p1 ' +
                            'where ' +
                            'p1.customers_id=$4 ' +
                            'and ' +
                            'p1.id=$5 ' +
                            'returning id',
                            [
                              newparentid,
                              world.newcode,
                              world.cn.userid,
                              world.cn.custid,
                              t.id
                            ],
                            function(err, result)
                            {
                              if (!err)
                              {
                                var newbuildtemplateid = result.rows[0].id;
                                //
                                idmap[t.id] = newbuildtemplateid;
                                //
                                tx.query
                                (
                                  'insert into ' +
                                  'buildtemplatedetails ' +
                                  '(' +
                                  'customers_id,' +
                                  'buildtemplateheaders_id,' +
                                  'products_id,' +
                                  'pricing_id,' +
                                  'qty,' +
                                  'price,' +
                                  'gst,' +
                                  'taxcodes_id,' +
                                  'pertemplateqty,' +
                                  'notes,' +
                                  'userscreated_id' +
                                  ') ' +
                                  'select ' +
                                  'p1.customers_id,' +
                                  '$1,' +
                                  'p1.products_id,' +
                                  'p1.pricing_id,' +
                                  'p1.qty,' +
                                  'p1.price,' +
                                  'p1.gst,' +
                                  'p1.taxcodes_id,' +
                                  'p1.pertemplateqty,' +
                                  'p1.notes,' +
                                  '$2 ' +
                                  'from ' +
                                  'buildtemplatedetails p1 ' +
                                  'where ' +
                                  'p1.customers_id=$3 ' +
                                  'and ' +
                                  'p1.buildtemplateheaders_id=$4 ' +
                                  'order by ' +
                                  'p1.id',
                                  [
                                    newbuildtemplateid,
                                    world.cn.userid,
                                    world.cn.custid,
                                    t.id
                                  ],
                                  function(err, result)
                                  {
                                    if (!err)
                                      callback(null, newbuildtemplateid);
                                    else
                                      callback(err);
                                  }
                                );
                              }
                              else
                                callback(err);
                            }
                          );
                        }
                      );
                    }
                  );

                  global.async.series
                  (
                    calls,
                    function(err, results)
                    {
                      if (!err)
                        resolve(results[0]);
                      else
                        reject(err);
                    }
                  );
                }
                else
                  reject(err);
              }
            );
          }
          else
            reject(err);
        }
      );
    }
  );
  return promise;
}

function doProductTemplateUpdateInventory(tx, products, custid, userid)
{
  var promise = new global.rsvp.Promise
  (
    function(resolve, reject)
    {
      var calls = [];

      products.forEach
      (
        function(p)
        {
          calls.push
          (
            function(callback)
            {
              var qty = __.toBigNum(p.qty);
              var inventoryqty = __.toBigNum(p.inventoryqty);

              // Enough in inventory?
              if (qty.lessThanOrEqualTo(inventoryqty))
              {
                tx.query
                (
                  'select qtyremaining from deductfrominventory($1,$2,$3,$4,$5,$6,$7)',
                  [
                    custid,
                    __.sanitiseAsBigInt(p.id),
                    __.formatnumber(p.qty),
                    __.formatnumber(p.costprice),
                    __.formatnumber(p.costgst),
                    itype_inventory_stock,
                    userid
                  ],
                  function(err, result)
                  {
                    if (!err && (result.rows.length == 1))
                      callback(null);
                    else
                      callback(err);
                  }
                );
              }
              else
                callback({rc: global.errcode_insufficientqty, message: 'Insufficient inventory for ' + p.name});
            }
          );
        }
      );

      global.async.series
      (
        calls,
        function(err, results)
        {
          if (!err)
            resolve(results);
          else
            reject(err);
        }
      );
    }
  );
  return promise;
}

function doGetProductTemplateDetails(tx, world)
{
  var promise = new global.rsvp.Promise
  (
    function(resolve, reject)
    {
      tx.query
      (
        'select ' +
        'ptd1.qty,' +
        'p1.id,' +
        'p1.name,' +
        'p1.costprice,' +
        'p1.costgst,' +
        'p1.inventoryqty ' +
        'from ' +
        'producttemplateheaders pth1 left join producttemplatedetails ptd1 on (pth1.id=ptd1.producttemplateheaders_id) ' +
        '                            left join products p1 on (ptd1.products_id=p1.id) ' +
        'where ' +
        'pth1.customers_id=$1 ' +
        'and ' +
        'pth1.id=$2',
        [
          world.cn.custid,
          __.sanitiseAsBigInt(world.producttemplateid)
        ],
        function(err, result)
        {
          if (!err)
            resolve(result.rows);
          else
            reject(err);
        }
      );
    }
  );
  return promise;
}

function doGetProductTemplateHeader(tx, world)
{
  var promise = new global.rsvp.Promise
  (
    function(resolve, reject)
    {
      // Default cost price of product to total price from template...
      // Create product in specified category (if any)
      tx.query
      (
        'select pth1.totalprice,pth1.totalgst,pth1.price,pth1.gst from producttemplateheaders pth1 where pth1.customers_id=$1 and pth1.id=$2',
        [
          world.cn.custid,
          __.sanitiseAsBigInt(world.producttemplateid)
        ],
        function(err, result)
        {
          if (!err)
            resolve({costprice: result.rows[0].totalprice, costgst: result.rows[0].totalgst, sellprice: result.rows[0].price, sellgst: result.rows[0].gst});
          else
            reject(err);
        }
      );
    }
  );
  return promise;
}

function doProductTemplateAddInventory(tx, world, header, config)
{
  var promise = new global.rsvp.Promise
  (
    function(resolve, reject)
    {
      tx.query
      (
        'insert into inventory (customers_id,locations_id,products_id,qty,type,costprice,costgst,userscreated_id) values($1,$2,$3,$4,$5,$6,$7,$8) returning id',
        [
          world.cn.custid,
          null,
          __.sanitiseAsBigInt(world.productid),
          world.qty,
          itype_inventory_stock,
          __.formatnumber(header.costprice, 4),
          __.formatnumber(header.costgst, 4),
          world.cn.userid
        ],
        function(err, result)
        {
          if (!err)
          {
            if (result.rows.length == 1)
              resolve(result.rows[0].id);
            else
              reject({message: global.text_unablesaveinventory});
          }
          else
            reject(err);
        }
      );
    }
  );
  return promise;
}

function doProductTemplateBuildAddPricing(tx, world, header, config)
{
  var promise = new global.rsvp.Promise
  (
    function(resolve, reject)
    {
      // Check if any prices yet for this product... If not, add one...
      tx.query
      (
        'select p1.id,p1.price,p1.gst from pricing p1 where p1.customers_id=$1 and p1.products_id=$2',
        [
          world.cn.custid,
          __.sanitiseAsBigInt(world.productid)
        ],
        function(err, result)
        {
          if (!err)
          {
            // No sell price(s) yet for this product?
            if (result.rows.length == 0)
            {
              tx.query
              (
                'insert into pricing (customers_id,products_id,price,gst,userscreated_id) values ($1,$2,$3,$4,$5)',
                [
                  world.cn.custid,
                  __.sanitiseAsBigInt(world.productid),
                  __.formatnumber(header.sellprice),
                  __.formatnumber(header.sellgst),
                  world.cn.userid
                ],
                function(err, result)
                {
                  if (!err)
                    resolve(null);
                  else
                    reject(err);
                }
              );
            }
            else
              resolve(null);
          }
          else
            reject(err);
        }
      );
    }
  );
  return promise;
}

function doNewProductTemplateDetail(tx, world)
{
  var promise = new global.rsvp.Promise
  (
    function(resolve, reject)
    {
      tx.query
      (
        'insert into producttemplatedetails (customers_id,producttemplateheaders_id,products_id,qty,price,userscreated_id) values ($1,$2,$3,$4,$5,$6) returning id',
        [
          world.cn.custid,
          __.sanitiseAsBigInt(world.producttemplateid),
          __.sanitiseAsBigInt(world.productid),
          __.sanitiseAsPrice(world.qty),
          __.sanitiseAsPrice(world.price),
          world.cn.userid
        ],
        function(err, result)
        {
          if (!err)
          {
            var producttemplatedetailid = result.rows[0].id;

            tx.query
            (
              'select p1.datecreated,u1.name usercreated from producttemplatedetails p1 left join users u1 on (p1.userscreated_id=u1.id) where p1.customers_id=$1 and p1.id=$2',
              [
                world.cn.custid,
                __.sanitiseAsBigInt(producttemplatedetailid)
              ],
              function(err, result)
              {
                if (!err)
                {
                  var d = result.rows[0];

                  // Note: We don't cascade this insertion as we don't have a product id at this point...
                  resolve
                  (
                    {
                      producttemplatedetailid: producttemplatedetailid,
                      datecreated: global.moment(d.datecreated).format('YYYY-MM-DD HH:mm:ss'),
                      usercreated: d.usercreated
                    }
                  );
                }
                else
                  reject({message: global.text_unablenewproducttemplatedetail});
              }
            );
          }
          else
            reject(err);
        }
      );
    }
  );
  return promise;
}

function doNewBuildTemplateDetail(tx, world)
{
  var promise = new global.rsvp.Promise
  (
    function(resolve, reject)
    {
      tx.query
      (
        'insert into buildtemplatedetails (customers_id,buildtemplateheaders_id,products_id,qty,price,userscreated_id) values ($1,$2,$3,$4,$5,$6) returning id',
        [
          world.cn.custid,
          __.sanitiseAsBigInt(world.buildtemplateid),
          __.sanitiseAsBigInt(world.productid),
          __.sanitiseAsPrice(world.qty),
          __.sanitiseAsPrice(world.price),
          world.cn.userid
        ],
        function(err, result)
        {
          if (!err)
          {
            var buildtemplatedetailid = result.rows[0].id;

            tx.query
            (
              'select p1.datecreated,u1.name usercreated from buildtemplatedetails p1 left join users u1 on (p1.userscreated_id=u1.id) where p1.customers_id=$1 and p1.id=$2',
              [
                world.cn.custid,
                __.sanitiseAsBigInt(buildtemplatedetailid)
              ],
              function(err, result)
              {
                if (!err)
                {
                  var d = result.rows[0];

                  // Note: We don't cascade this insertion as we don't have a product id at this point...
                  resolve
                  (
                    {
                      buildtemplatedetailid: buildtemplatedetailid,
                      datecreated: global.moment(d.datecreated).format('YYYY-MM-DD HH:mm:ss'),
                      usercreated: d.usercreated
                    }
                  );
                }
                else
                  reject({message: global.text_unablenewbuildtemplatedetail});
              }
            );
          }
          else
            reject(err);
        }
      );
    }
  );
  return promise;
}

function doSaveProductTemplateDetail(tx, world)
{
  var promise = new global.rsvp.Promise
  (
    function(resolve, reject)
    {
      tx.query
      (
        'update producttemplatedetails set products_id=$1,price=$2,qty=$3,pertemplateqty=$4,gst=calctaxcomponent($5,$6,$7),taxcodes_id=$8,datemodified=now(),usersmodified_id=$9 where customers_id=$10 and id=$11 and dateexpired is null',
        [
          __.sanitiseAsBigInt(world.productid),
          __.sanitiseAsPrice(world.price, 4),
          __.sanitiseAsPrice(world.qty, 4),
          __.sanitiseAsBool(world.pertemplateqty),
          //
          world.cn.custid,
          __.sanitiseAsPrice(world.price, 4),
          __.sanitiseAsBigInt(world.taxcodeid),
          //
          __.sanitiseAsBigInt(world.taxcodeid),
          world.cn.userid,
          world.cn.custid,
          __.sanitiseAsBigInt(world.producttemplatedetailid)
        ],
        function(err, result)
        {
          if (!err)
          {
            tx.query
            (
              'select p1.producttemplateheaders_id producttemplateid,p1.datemodified,u1.name from producttemplatedetails p1 left join users u1 on (p1.usersmodified_id=u1.id) where p1.customers_id=$1 and p1.id=$2',
              [
                world.cn.custid,
                __.sanitiseAsBigInt(world.producttemplatedetailid)
              ],
              function(err, result)
              {
                if (!err)
                  resolve({producttemplateid: result.rows[0].producttemplateid, datemodified: global.moment(result.rows[0].datemodified).format('YYYY-MM-DD HH:mm:ss'), usermodified: result.rows[0].name});
                else
                  reject(err);
              }
            );
          }
          else
            reject(err);
        }
      );
    }
  );
  return promise;
}

function doSaveBuildTemplateDetail(tx, world)
{
  var promise = new global.rsvp.Promise
  (
    function(resolve, reject)
    {
      tx.query
      (
        'update buildtemplatedetails set products_id=$1,price=$2,qty=$3,pertemplateqty=$4,gst=calctaxcomponent($5,$6,$7),taxcodes_id=$8,datemodified=now(),usersmodified_id=$9 where customers_id=$10 and id=$11 and dateexpired is null',
        [
          __.sanitiseAsBigInt(world.productid),
          __.sanitiseAsPrice(world.price, 4),
          __.sanitiseAsPrice(world.qty, 4),
          __.sanitiseAsBool(world.pertemplateqty),
          //
          world.cn.custid,
          __.sanitiseAsPrice(world.price, 4),
          __.sanitiseAsBigInt(world.taxcodeid),
          //
          __.sanitiseAsBigInt(world.taxcodeid),
          world.cn.userid,
          world.cn.custid,
          __.sanitiseAsBigInt(world.buildtemplatedetailid)
        ],
        function(err, result)
        {
          if (!err)
          {
            tx.query
            (
              'select p1.buildtemplateheaders_id buildtemplateid,p1.datemodified,u1.name from buildtemplatedetails p1 left join users u1 on (p1.usersmodified_id=u1.id) where p1.customers_id=$1 and p1.id=$2',
              [
                world.cn.custid,
                __.sanitiseAsBigInt(world.buildtemplatedetailid)
              ],
              function(err, result)
              {
                if (!err)
                  resolve({buildtemplateid: result.rows[0].buildtemplateid, datemodified: global.moment(result.rows[0].datemodified).format('YYYY-MM-DD HH:mm:ss'), usermodified: result.rows[0].name});
                else
                  reject(err);
              }
            );
          }
          else
            reject(err);
        }
      );
    }
  );
  return promise;
}

function doExpireProductTemplateDetail(tx, world)
{
  var promise = new global.rsvp.Promise
  (
    function(resolve, reject)
    {
      tx.query
      (
        'update producttemplatedetails set dateexpired=now(),usersexpired_id=$1 where customers_id=$2 and id=$3 and dateexpired is null',
        [
          world.cn.userid,
          world.cn.custid,
          __.sanitiseAsBigInt(world.producttemplatedetailid)
        ],
        function(err, result)
        {
          if (!err)
          {
            tx.query
            (
              'select t1.producttemplateheaders_id producttemplateid,t1.dateexpired,u1.name from producttemplatedetails t1 left join users u1 on (t1.usersexpired_id=u1.id) where t1.customers_id=$1 and t1.id=$2',
              [
                world.cn.custid,
                __.sanitiseAsBigInt(world.producttemplatedetailid)
              ],
              function(err, result)
              {
                if (!err)
                  resolve({producttemplateid: result.rows[0].producttemplateid, dateexpired: global.moment(result.rows[0].dateexpired).format('YYYY-MM-DD HH:mm:ss'), userexpired: result.rows[0].name});
                else
                  reject(err);
              }
            );
          }
          else
            reject(err);
        }
      );
    }
  );
  return promise;
}

function doExpireBuildTemplateDetail(tx, world)
{
  var promise = new global.rsvp.Promise
  (
    function(resolve, reject)
    {
      tx.query
      (
        'update buildtemplatedetails set dateexpired=now(),usersexpired_id=$1 where customers_id=$2 and id=$3 and dateexpired is null',
        [
          world.cn.userid,
          world.cn.custid,
          __.sanitiseAsBigInt(world.buildtemplatedetailid)
        ],
        function(err, result)
        {
          if (!err)
          {
            tx.query
            (
              'select t1.buildtemplateheaders_id buildtemplateid,t1.dateexpired,u1.name from buildtemplatedetails t1 left join users u1 on (t1.usersexpired_id=u1.id) where t1.customers_id=$1 and t1.id=$2',
              [
                world.cn.custid,
                __.sanitiseAsBigInt(world.buildtemplatedetailid)
              ],
              function(err, result)
              {
                if (!err)
                  resolve({buildtemplateid: result.rows[0].buildtemplateid, dateexpired: global.moment(result.rows[0].dateexpired).format('YYYY-MM-DD HH:mm:ss'), userexpired: result.rows[0].name});
                else
                  reject(err);
              }
            );
          }
          else
            reject(err);
        }
      );
    }
  );
  return promise;
}

function doExpireProduct(tx, world)
{
  var promise = new global.rsvp.Promise
  (
    function(resolve, reject)
    {
      tx.query
      (
        'update products set dateexpired=now(),usersexpired_id=$1 where customers_id=$2 and id=$3 and dateexpired is null',
        [
          world.cn.userid,
          world.cn.custid,
          __.sanitiseAsBigInt(world.productid)
        ],
        function(err, result)
        {
          if (!err)
          {
            tx.query
            (
              'select p1.productcategories_id productcategoryid,p1.dateexpired,u1.name from products p1 left join users u1 on (p1.usersmodified_id=u1.id) where p1.customers_id=$1 and p1.id=$2',
              [
                world.cn.custid,
                __.sanitiseAsBigInt(world.productid)
              ],
              function(err, result)
              {
                if (!err)
                  resolve({productcategoryid: result.rows[0].productcategoryid, dateexpired: global.moment(result.rows[0].dateexpired).format('YYYY-MM-DD HH:mm:ss'), userexpired: result.rows[0].name});
                else
                  reject(err);
              }
            );
          }
          else
            reject(err);
        }
      );
    }
  );
  return promise;
}

function doExpireProductCode(tx, world)
{
  var promise = new global.rsvp.Promise
  (
    function(resolve, reject)
    {
      tx.query
      (
        'update productcodes set dateexpired=now(),usersexpired_id=$1 where customers_id=$2 and id=$3 and dateexpired is null',
        [
          world.cn.userid,
          world.cn.custid,
          __.sanitiseAsBigInt(world.productcodeid)
        ],
        function(err, result)
        {
          if (!err)
          {
            tx.query
            (
              'select p1.products_id productid,p1.dateexpired,u1.name from productcodes p1 left join users u1 on (p1.usersmodified_id=u1.id) where p1.customers_id=$1 and p1.id=$2',
              [
                world.cn.custid,
                __.sanitiseAsBigInt(world.productcodeid)
              ],
              function(err, result)
              {
                if (!err)
                  resolve({productid: result.rows[0].productid, dateexpired: global.moment(result.rows[0].dateexpired).format('YYYY-MM-DD HH:mm:ss'), userexpired: result.rows[0].name});
                else
                  reject(err);
              }
            );
          }
          else
            reject(err);
        }
      );
    }
  );
  return promise;
}

function doNewDiscountCode(tx, world)
{
  var promise = new global.rsvp.Promise
  (
    function(resolve, reject)
    {
      tx.query
      (
        'insert into discountcode (userscreated_id) values ($1) returning id',
        [
          world.cn.userid
        ],
        function(err, result)
        {
          if (!err)
          {
            var discountcode_id = result.rows[0].id;

            tx.query
            (
              'select d1.datecreated,u1.name usercreated from discountcode d1 left join users u1 on (d1.userscreated_id=u1.id) where d1.id=$1',
              [
                __.sanitiseAsBigInt(discountcode_id)
              ],
              function(err, result)
              {
                if (!err)
                {
                  var p = result.rows[0];
                  global.ConsoleLog("doNewDiscountCode" + p);

                  resolve
                  (
                    {
                      discountcodeid: discountcode_id,
                      datecreated: global.moment(p.datecreated).format('YYYY-MM-DD HH:mm:ss'),
                      usercreated: p.usercreated
                    }
                  );
                }
                else
                  reject({message: global.text_unablenewdiscountcode});
              }
            );
          }
          else
            reject(err);
        }
      );
    }
  );
  return promise;
}

function doSaveDiscountCode(tx, world)
{
  var promise = new global.rsvp.Promise
  (
    function(resolve, reject)
    {
      // global.ConsoleLog("world.datefrom");
      // global.ConsoleLog(world.datefrom);
      // global.ConsoleLog(typeof world.datefrom);
      // global.ConsoleLog(__.sanitiseAsDate(world.datefrom));
      // global.ConsoleLog(typeof __.sanitiseAsDate(world.datefrom));
      tx.query
      (
        "update discountcode set full_name=$16, short_name=$17, level_1=$1, level_2=$2, level_3=$3, level_4=$4, level_5=$5, level_6=$6, level_7=$7, level_8=$8, level_9=$9, level_10=$10, level_11=$11, level_12=$12, level_13=$13, level_14=$14, level_15=$15, usersmodified_id=$18,  datemodified=now() where id = $19 and dateexpired is null",
        [
          world.level1,
          world.level2,
          world.level3,
          world.level4,
          world.level5,
          world.level6,
          world.level7,
          world.level8,
          world.level9,
          world.level10,
          world.level11,
          world.level12,
          world.level13,
          world.level14,
          world.level15,
          world.fullname,
          world.shortname,
          world.cn.userid,
          __.sanitiseAsBigInt(world.discountcodeid)
        ],
        function(err, result)
        {
          if (!err)
          {
            tx.query
            (
              'select d1.id ,d1.datemodified,u1.name from discountcode d1 left join users u1 on (d1.usersmodified_id=u1.id) where d1.id=$1',
              [
                __.sanitiseAsBigInt(world.discountcodeid)
              ],
              function(err, result)
              {
                if (!err)
                  resolve({discountcodeid: result.rows[0].id, datemodified: global.moment(result.rows[0].datemodified).format('YYYY-MM-DD HH:mm:ss'), usermodified: result.rows[0].name});
                else
                  reject(err);
              }
            );
          }
          else
          {
            global.ConsoleLog(err);
            reject(err);
          }
            
        }
      );
    }
  );
  return promise;
}

function doExpireDiscountCode(tx, world)
{
  var promise = new global.rsvp.Promise
  (
    function(resolve, reject)
    {
      tx.query
      (
        'update discountcode set dateexpired=now(),usersexpired_id=$1 where id=$2 and dateexpired is null',
        [
          world.cn.userid,
          __.sanitiseAsBigInt(world.discountcodeid)
        ],
        function(err, result)
        {
          if (!err)
          {
            tx.query
            (
              'select d1.id ,d1.dateexpired,u1.name from discountcode d1 left join users u1 on (d1.usersexpired_id=u1.id) where d1.id=$1',
              [
                __.sanitiseAsBigInt(world.discountcodeid)
              ],
              function(err, result)
              {
                if (!err)
                  resolve({discountcodeid: result.rows[0].id, dateexpired: global.moment(result.rows[0].dateexpired).format('YYYY-MM-DD HH:mm:ss'), userexpired: result.rows[0].name});
                else
                  reject(err);
              }
            );
          }
          else
            reject(err);
        }
      );
    }
  );
  return promise;
}

function doNewListPriceCode(tx, world)
{
  var promise = new global.rsvp.Promise
  (
    function(resolve, reject)
    {
      tx.query
      (
        'insert into listpricecode (userscreated_id) values ($1) returning id',
        [
          world.cn.userid
        ],
        function(err, result)
        {
          if (!err)
          {
            var listpricecodeid = result.rows[0].id;

            tx.query
            (
              'select l1.datecreated,u1.name usercreated from listpricecode l1 left join users u1 on (l1.userscreated_id=u1.id) where l1.id=$1',
              [
                __.sanitiseAsBigInt(listpricecodeid)
              ],
              function(err, result)
              {
                if (!err)
                {
                  var p = result.rows[0];
                  //global.ConsoleLog("doNewDiscountCode" + p);

                  resolve
                  (
                    {
                      listpricecodeid: listpricecodeid,
                      datecreated: global.moment(p.datecreated).format('YYYY-MM-DD HH:mm:ss'),
                      usercreated: p.usercreated
                    }
                  );
                }
                else
                  reject({message: global.text_unablenewlistpricecode});
              }
            );
          }
          else
            reject(err);
        }
      );
    }
  );
  return promise;
}

function doSaveListPriceCode(tx, world)
{
  var promise = new global.rsvp.Promise
  (
    function(resolve, reject)
    {
      // global.ConsoleLog("world.datefrom");
      // global.ConsoleLog(world.datefrom);
      // global.ConsoleLog(typeof world.datefrom);
      // global.ConsoleLog(__.sanitiseAsDate(world.datefrom));
      // global.ConsoleLog(typeof __.sanitiseAsDate(world.datefrom));
      tx.query
      (
        "update listpricecode set full_name=$1, short_name=$2, parameter=$3, usersmodified_id=$4,  datemodified=now() where id = $5 and dateexpired is null",
        [
          world.fullname,
          world.shortname,
          world.parameter,
          world.cn.userid,
          __.sanitiseAsBigInt(world.listpricecodeid)
        ],
        function(err, result)
        {
          if (!err)
          {
            tx.query
            (
              'select l1.id ,l1.datemodified,u1.name from listpricecode l1 left join users u1 on (l1.usersmodified_id=u1.id) where l1.id=$1',
              [
                __.sanitiseAsBigInt(world.listpricecodeid)
              ],
              function(err, result)
              {
                if (!err)
                  resolve({listpricecodeid: result.rows[0].id, datemodified: global.moment(result.rows[0].datemodified).format('YYYY-MM-DD HH:mm:ss'), usermodified: result.rows[0].name});
                else
                  reject(err);
              }
            );
          }
          else
          {
            global.ConsoleLog(err);
            reject(err);
          }
            
        }
      );
    }
  );
  return promise;
}

function doExpireListPriceCode(tx, world)
{
  var promise = new global.rsvp.Promise
  (
    function(resolve, reject)
    {
      tx.query
      (
        'update listpricecode set dateexpired=now(),usersexpired_id=$1 where id=$2 and dateexpired is null',
        [
          world.cn.userid,
          __.sanitiseAsBigInt(world.listpricecodeid)
        ],
        function(err, result)
        {
          if (!err)
          {
            tx.query
            (
              'select l1.id ,l1.dateexpired,u1.name from listpricecode l1 left join users u1 on (l1.usersexpired_id=u1.id) where l1.id=$1',
              [
                __.sanitiseAsBigInt(world.listpricecodeid)
              ],
              function(err, result)
              {
                if (!err)
                  resolve({listpricecodeid: result.rows[0].id, dateexpired: global.moment(result.rows[0].dateexpired).format('YYYY-MM-DD HH:mm:ss'), userexpired: result.rows[0].name});
                else
                  reject(err);
              }
            );
          }
          else
            reject(err);
        }
      );
    }
  );
  return promise;
}


// *******************************************************************************************************************************************************************************************
// Public functions
function ListProductCategories(world)
{
  var msg = '[' + world.eventname + '] ';
  //
  global.pg.connect
  (
    global.cs,
    function(err, client, done)
    {
      if (!err)
      {
        client.query
        (
          'select ' +
          'pc1.id,' +
          'pc1.code,' +
          'pc1.altcode,' +
          'pc1.name,' +
          'pc1.notes,' +
          'pc1.path,' +
          'pc1.datecreated,' +
          'pc1.datemodified,' +
          'pc2.id parentid,' +
          'pc2.code parentcode,' +
          'pc2.name parentname,' +
          'u1.name usercreated,' +
          'u2.name usermodified ' +
          'from ' +
          'productcategories pc1 left join productcategories pc2 on (pc1.productcategories_id=pc2.id) ' +
          '                      left join users u1 on (pc1.userscreated_id=u1.id) ' +
          '                      left join users u2 on (pc1.usersmodified_id=u2.id) ' +
          'where ' +
          'pc1.customers_id=$1 ' +
          'and ' +
          'pc1.dateexpired is null ' +
          'order by ' +
          'pc1.path,' +
          'pc2.id desc,' +
          'pc1.name,' +
          'pc1.code',
          [
            world.cn.custid
          ],
          function(err, result)
          {
            done();

            if (!err)
            {
              // JS returns date with TZ info/format, need in ISO format...
              result.rows.forEach
              (
                function(p)
                {
                  if (!__.isUndefined(p.datemodified) && !__.isNull(p.datemodified))
                    p.datemodified = global.moment(p.datemodified).format('YYYY-MM-DD HH:mm:ss');

                  p.datecreated = global.moment(p.datecreated).format('YYYY-MM-DD HH:mm:ss');
                }
              );

              world.spark.emit(world.eventname, {rc: global.errcode_none, msg: global.text_success, fguid: world.fguid, rs: result.rows, pdata: world.pdata});
            }
            else
            {
              msg += global.text_generalexception + ' ' + err.message;
              global.log.error({listproductcategories: true}, msg);
              world.spark.emit(global.eventerror, {rc: global.errcode_fatal, msg: msg, pdata: world.pdata});
            }
          }
        );
      }
      else
      {
        global.log.error({listproductcategories: true}, global.text_nodbconnection);
        world.spark.emit(global.eventerror, {rc: global.errcode_dbunavail, msg: global.text_nodbconnection, pdata: world.pdata});
      }
    }
  );
}

function LoadProductCategory(world)
{
  var msg = '[' + world.eventname + '] ';
  //
  global.pg.connect
  (
    global.cs,
    function(err, client, done)
    {
      if (!err)
      {
        client.query
        (
          'select ' +
          'pc1.id,' +
          'pc1.code,' +
          'pc1.altcode,' +
          'pc1.name,' +
          'pc1.notes,' +
          'pc1.path,' +
          'pc1.datecreated,' +
          'pc1.datemodified,' +
          'pc2.id parentid,' +
          'pc2.code parentcode,' +
          'pc2.name parentname,' +
          'u1.name usercreated,' +
          'u2.name usermodified ' +
          'from ' +
          'productcategories pc1 left join productcategories pc2 on (pc1.productcategories_id=pc2.id) ' +
          '                      left join users u1 on (pc1.userscreated_id=u1.id) ' +
          '                      left join users u2 on (pc1.usersmodified_id=u2.id) ' +
          'where ' +
          'pc1.customers_id=$1 ' +
          'and ' +
          'pc1.id=$2',
          [
            world.cn.custid,
            __.sanitiseAsBigInt(world.productcategoryid)
          ],
          function(err, result)
          {
            done();

            if (!err)
            {
              // JS returns date with TZ info/format, need in ISO format...
              result.rows.forEach
              (
                function(p)
                {
                  if (!__.isUndefined(p.notes) && !__.isNull(p.notes))
                    p.notes = __.unescapeHTML(p.notes);

                  if (!__.isUndefined(p.datemodified) && !__.isNull(p.datemodified))
                    p.datemodified = global.moment(p.datemodified).format('YYYY-MM-DD HH:mm:ss');

                  p.datecreated = global.moment(p.datecreated).format('YYYY-MM-DD HH:mm:ss');
                }
              );

              world.spark.emit(world.eventname, {rc: global.errcode_none, msg: global.text_success, fguid: world.fguid, productcategory: result.rows[0], pdata: world.pdata});
            }
            else
            {
              msg += global.text_generalexception + ' ' + err.message;
              global.log.error({loadproductcategory: true}, msg);
              world.spark.emit(global.eventerror, {rc: global.errcode_fatal, msg: msg, pdata: world.pdata});
            }
          }
        );
      }
      else
      {
        global.log.error({loadproductcategory: true}, global.text_nodbconnection);
        world.spark.emit(global.eventerror, {rc: global.errcode_dbunavail, msg: global.text_nodbconnection, pdata: world.pdata});
      }
    }
  );
}

function NewProductCategory(world)
{
  var msg = '[' + world.eventname + '] ';
  //
  global.pg.connect
  (
    global.cs,
    function(err, client, done)
    {
      if (!err)
      {
        var tx = new global.pgtx(client);
        tx.begin
        (
          function(err)
          {
            if (!err)
            {
              global.modhelpers.NewUniqueCode(tx, world.cn.custid).then
              (
                function(newcode)
                {
                  world.newcode = newcode;
                  return doNewProductCategory(tx, world);
                }
              ).then
              (
                function(result)
                {
                  tx.commit
                  (
                    function(err)
                    {
                      if (!err)
                      {
                        done();
                        world.spark.emit
                        (
                          world.eventname,
                          {
                            rc: global.errcode_none,
                            msg: global.text_success,
                            productcategoryid: result.productcategoryid,
                            parentid: world.parentid,
                            datecreated: result.datecreated,
                            usercreated: result.usercreated,
                            pdata: world.pdata
                          }
                        );
                        global.pr.sendToRoomExcept
                        (
                          global.custchannelprefix + world.cn.custid,
                          'productcategorycreated',
                          {
                            productcategoryid: result.productcategoryid,
                            parentid: world.parentid,
                            datecreated: result.datecreated,
                            usercreated: result.usercreated
                          },
                          world.spark.id
                        );
                      }
                      else
                      {
                        tx.rollback
                        (
                          function(ignore)
                          {
                            done();
                            msg += global.text_tx + ' ' + err.message;
                            global.log.error({newproductcategory: true}, msg);
                            world.spark.emit(global.eventerror, {rc: global.errcode_dberr, msg: msg, pdata: world.pdata});
                          }
                        );
                      }
                    }
                  );
                }
              ).then
              (
                null,
                function(err)
                {
                  tx.rollback
                  (
                    function(ignore)
                    {
                      done();

                      msg += global.text_generalexception + ' ' + err.message;
                      global.log.error({newproductcategory: true}, msg);
                      world.spark.emit(global.eventerror, {rc: global.errcode_fatal, msg: msg, pdata: world.pdata});
                    }
                  );
                }
              );
            }
            else
            {
              done();
              msg += global.text_notxstart + ' ' + err.message;
              global.log.error({newproductcategory: true}, msg);
              world.spark.emit(global.eventerror, {rc: global.errcode_dberr, msg: msg, pdata: world.pdata});
            }
          }
        );
      }
      else
      {
        global.log.error({newproductcategory: true}, global.text_nodbconnection);
        world.spark.emit(global.eventerror, {rc: global.errcode_dbunavail, msg: global.text_nodbconnection, pdata: world.pdata});
      }
    }
  );
}

function SaveProductCategory(world)
{
  var msg = '[' + world.eventname + '] ';
  //
  global.pg.connect
  (
    global.cs,
    function(err, client, done)
    {
      if (!err)
      {
        var tx = new global.pgtx(client);
        tx.begin
        (
          function(err)
          {
            if (!err)
            {
              doSaveProductCategory(tx, world).then
              (
                function(result)
                {
                  tx.commit
                  (
                    function(err)
                    {
                      if (!err)
                      {
                        done();
                        world.spark.emit(world.eventname, {rc: global.errcode_none, msg: global.text_success, productcategoryid: world.productcategoryid, datemodified: result.datemodified, usermodified: result.usermodified, pdata: world.pdata});
                        global.pr.sendToRoomExcept(global.custchannelprefix + world.cn.custid, 'productcategorysaved', {productcategoryid: world.productcategoryid, datemodified: result.datemodified, usermodified: result.usermodified}, world.spark.id);
                      }
                      else
                      {
                        tx.rollback
                        (
                          function(ignore)
                          {
                            done();
                            msg += global.text_tx + ' ' + err.message;
                            global.log.error({changeproductcategoryfield: true}, msg);
                            world.spark.emit(global.eventerror, {rc: global.errcode_dberr, msg: msg, pdata: world.pdata});
                          }
                        );
                      }
                    }
                  );
                }
              ).then
              (
                null,
                function(err)
                {
                  tx.rollback
                  (
                    function(ignore)
                    {
                      done();

                      msg += global.text_generalexception + ' ' + err.message;
                      global.log.error({changeproductcategoryfield: true}, msg);
                      world.spark.emit(global.eventerror, {rc: global.errcode_fatal, msg: msg, pdata: world.pdata});
                    }
                  );
                }
              );
            }
            else
            {
              done();
              msg += global.text_notxstart + ' ' + err.message;
              global.log.error({changeproductcategoryfield: true}, msg);
              world.spark.emit(global.eventerror, {rc: global.errcode_dberr, msg: msg, pdata: world.pdata});
            }
          }
        );
      }
      else
      {
        global.log.error({changeproductcategoryfield: true}, global.text_nodbconnection);
        world.spark.emit(global.eventerror, {rc: global.errcode_dbunavail, msg: global.text_nodbconnection, pdata: world.pdata});
      }
    }
  );
}

function ChangeProductCategoryParent(world)
{
  var msg = '[' + world.eventname + '] ';
  //
  global.pg.connect
  (
    global.cs,
    function(err, client, done)
    {
      if (!err)
      {
        var tx = new global.pgtx(client);
        tx.begin
        (
          function(err)
          {
            if (!err)
            {
              doChangeProductCategoryParent(tx, world).then
              (
                function(result)
                {
                  tx.commit
                  (
                    function(err)
                    {
                      if (!err)
                      {
                        done();
                        world.spark.emit(world.eventname, {rc: global.errcode_none, msg: global.text_success, productcategoryid: world.productcategoryid, parentid: world.parentid, datemodified: result.datemodified, usermodified: result.usermodified, pdata: world.pdata});
                        global.pr.sendToRoomExcept(global.custchannelprefix + world.cn.custid, 'productcategoryparentchanged', {productcategoryid: world.productcategoryid, parentid: world.parentid, datemodified: result.datemodified, usermodified: result.usermodified}, world.spark.id);
                      }
                      else
                      {
                        tx.rollback
                        (
                          function(ignore)
                          {
                            done();
                            msg += global.text_tx + ' ' + err.message;
                            global.log.error({changeproductcategoryparent: true}, msg);
                            world.spark.emit(global.eventerror, {rc: global.errcode_dberr, msg: msg, pdata: world.pdata});
                          }
                        );
                      }
                    }
                  );
                }
              ).then
              (
                null,
                function(err)
                {
                  tx.rollback
                  (
                    function(ignore)
                    {
                      done();

                      msg += global.text_generalexception + ' ' + err.message;
                      global.log.error({changeproductcategoryparent: true}, msg);
                      world.spark.emit(global.eventerror, {rc: global.errcode_fatal, msg: msg, pdata: world.pdata});
                    }
                  );
                }
              );
            }
            else
            {
              done();
              msg += global.text_notxstart + ' ' + err.message;
              global.log.error({changeproductcategoryparent: true}, msg);
              world.spark.emit(global.eventerror, {rc: global.errcode_dberr, msg: msg, pdata: world.pdata});
            }
          }
        );
      }
      else
      {
        global.log.error({changeproductcategoryparent: true}, global.text_nodbconnection);
        world.spark.emit(global.eventerror, {rc: global.errcode_dbunavail, msg: global.text_nodbconnection, pdata: world.pdata});
      }
    }
  );
}

function ExpireProductCategory(world)
{
  var msg = '[' + world.eventname + '] ';
  //
  global.pg.connect
  (
    global.cs,
    function(err, client, done)
    {
      if (!err)
      {
        var tx = new global.pgtx(client);
        tx.begin
        (
          function(err)
          {
            if (!err)
            {
              // If cascade is true, we just expire this category and trigger will expire all children...
              // Otherwise...
              // First find parent of this category (which could be null if no parent)
              // Set that as new parent of immediate children - their subschildren will be updated by triggers
              // Finally expire this category
              //
              // Note if we expire this category first, children and subschildren will autoexpire by the triggers
              doExpireProductCategoryStep1(tx, world).then
              (
                function(ignore)
                {
                  return doExpireProductCategoryStep2(tx, world);
                }
              ).then
              (
                function(result)
                {
                  tx.commit
                  (
                    function(err)
                    {
                      if (!err)
                      {
                        done();
                        world.spark.emit(world.eventname, {rc: global.errcode_none, msg: global.text_success, productcategoryid: world.productcategoryid, dateexpired: result.dateexpired, userexpired: result.userexpired, pdata: world.pdata});
                        global.pr.sendToRoomExcept(global.custchannelprefix + world.cn.custid, 'productcategoryexpired', {productcategoryid: world.productcategoryid, dateexpired: result.dateexpired, userexpired: result.userexpired}, world.spark.id);
                      }
                      else
                      {
                        tx.rollback
                        (
                          function(ignore)
                          {
                            done();
                            msg += global.text_tx + ' ' + err.message;
                            global.log.error({expireproductcategory: true}, msg);
                            world.spark.emit(global.eventerror, {rc: global.errcode_dberr, msg: msg, pdata: world.pdata});
                          }
                        );
                      }
                    }
                  );
                }
              ).then
              (
                null,
                function(err)
                {
                  tx.rollback
                  (
                    function(ignore)
                    {
                      done();

                      msg += global.text_generalexception + ' ' + err.message;
                      global.log.error({expireproductcategory: true}, msg);
                      world.spark.emit(global.eventerror, {rc: global.errcode_fatal, msg: msg, pdata: world.pdata});
                    }
                  );
                }
              );
            }
            else
            {
              done();
              msg += global.text_notxstart + ' ' + err.message;
              global.log.error({expireproductcategory: true}, msg);
              world.spark.emit(global.eventerror, {rc: global.errcode_dberr, msg: msg, pdata: world.pdata});
            }
          }
        );
      }
      else
      {
        global.log.error({expireproductcategory: true}, global.text_nodbconnection);
        world.spark.emit(global.eventerror, {rc: global.errcode_dbunavail, msg: global.text_nodbconnection, pdata: world.pdata});
      }
    }
  );
}

function CheckProductCategoryCode(world)
{
  var msg = '[' + world.eventname + '] ';
  //
  global.pg.connect
  (
    global.cs,
    function(err, client, done)
    {
      if (!err)
      {
        var binds = [world.cn.custid, world.code];
        var clause = '';

        if (!__.isNull(world.productcategoryid))
        {
          clause = ' and pc1.id!=$3';
          binds.push(world.productcategoryid);
        }

        client.query
        (
          'select ' +
          'pc1.id,' +
          'pc1.code,' +
          'pc1.name ' +
          'from ' +
          'productcategories pc1 ' +
          'where ' +
          'pc1.customers_id=$1 ' +
          'and ' +
          'pc1.dateexpired is null ' +
          'and ' +
          'upper(pc1.code)=upper($2)' +
          clause,
          binds,
          function(err, result)
          {
            done();

            if (!err)
              world.spark.emit(world.eventname, {rc: global.errcode_none, msg: global.text_success, fguid: world.fguid, rs: result.rows, pdata: world.pdata});
            else
            {
              msg += global.text_generalexception + ' ' + err.message;
              global.log.error({checkproductcategorycode: true}, msg);
              world.spark.emit(global.eventerror, {rc: global.errcode_fatal, msg: msg, pdata: world.pdata});
            }
          }
        );
      }
      else
      {
        global.log.error({checkproductcategorycode: true}, global.text_nodbconnection);
        world.spark.emit(global.eventerror, {rc: global.errcode_dbunavail, msg: global.text_nodbconnection, pdata: world.pdata});
      }
    }
  );
}

function ListProducts(world)
{
  var msg = '[' + world.eventname + '] ';
  //
  global.pg.connect
  (
    global.cs,
    function(err, client, done)
    {
      if (!err)
      {
        var clause = __.isUndefined(world.showinactive) || __.isNull(world.showinactive) || (world.showinactive == 0) || (world.showinactive == '0') || !world.showinactive ? 'and p1.isactive=1 ' : '';

        client.query
        (
          'select ' +
          'p1.id,' +
          'p1.productcategories_id productcategoryid,' +
          'p1.code,' +
          'p1.altcode,' +
          'p1.barcode,' +
          'p1.name,' +
          'p1.notes,' +
          'p1.costprice,' +
          'p1.costgst,' +
          'p1.uom,' +
          'p1.uomsize,' +
          'p1.sale_uom,' +
          'p1.sale_uomsize,' +
          'p1.buildtemplateheaders_id buildtemplateid,' +
          'p1.minstockqty,' +
          'p1.stockqtywarnthreshold,' +
          'p1.width,' +
          'p1.length,' +
          'p1.height,' +
          'p1.weight,' +
          'p1.datecreated,' +
          'p1.datemodified,' +
          'pc1.code productcategorycode,' +
          'pc1.name productcategoryname,' +
          'p1.buytaxcodes_id buytaxcodeid,' +
          'p1.selltaxcodes_id selltaxcodeid,' +
          'p1.costofgoodsaccounts_id costofgoodsaccountid,' +
          'p1.incomeaccounts_id incomeaccountid,' +
          'p1.assetaccounts_id assetaccountid,' +
          'p1.isactive,' +
          'p1.productsalias_id productaliasid,' +
          'p1.locations1_id location1id,' +
          'p1.locations2_id location2id,' +
          'p1.discountcode_id discountcodeid,' +
          'p1.clients_id clientid,' +
          't1.name buytaxcode,' +
          't2.name selltaxcode,' +
          'a1.name saleaccount,' +
          'a2.name incomeaccount,' +
          'a3.name assetacount,' +
          'c1.price sellprice,' +
          'c1.gst sellgst,' +
          'u1.name usercreated,' +
          'u2.name usermodified ' +
          'from ' +
          'products p1 left join productcategories pc1 on (p1.productcategories_id=pc1.id) ' +
          '            left join pricing c1 on (p1.id=c1.products_id and c1.clients_id is null) ' +
          '            left join taxcodes t1 on (p1.buytaxcodes_id=t1.id) ' +
          '            left join taxcodes t2 on (p1.selltaxcodes_id=t2.id) ' +
          '            left join accounts a1 on (p1.costofgoodsaccounts_id=a1.id) ' +
          '            left join accounts a2 on (p1.incomeaccounts_id=a2.id) ' +
          '            left join accounts a3 on (p1.assetaccounts_id=a3.id) ' +
          '            left join users u1 on (p1.userscreated_id=u1.id) ' +
          '            left join users u2 on (p1.usersmodified_id=u2.id) ' +
          'where ' +
          'p1.customers_id=$1 ' +
          clause +
          'and ' +
          'p1.dateexpired is null ' +
          'order by ' +
          'pc1.code,' +
          'pc1.name,' +
          'p1.code,' +
          'p1.name',
          [
            world.cn.custid
          ],
          function(err, result)
          {
            done();
            // global.ConsoleLog('clause:');
            // global.ConsoleLog(clause);

            if (!err)
            {
              // JS returns date with TZ info/format, need in ISO format...
              result.rows.forEach
              (
                function(p)
                {
                  if (!__.isUndefined(p.notes) && !__.isNull(p.notes))
                    p.notes = __.unescapeHTML(p.notes);

                  if (!__.isUndefined(p.datemodified) && !__.isNull(p.datemodified))
                    p.datemodified = global.moment(p.datemodified).format('YYYY-MM-DD HH:mm:ss');

                  p.datecreated = global.moment(p.datecreated).format('YYYY-MM-DD HH:mm:ss');
                }
              );

              world.spark.emit(world.eventname, {rc: global.errcode_none, msg: global.text_success, fguid: world.fguid, rs: result.rows, pdata: world.pdata});
            }
            else
            {
              msg += global.text_generalexception + ' ' + err.message;
              global.log.error({listproducts: true}, msg);
              world.spark.emit(global.eventerror, {rc: global.errcode_fatal, msg: msg, pdata: world.pdata});
            }
          }
        );
      }
      else
      {
        global.log.error({listproducts: true}, global.text_nodbconnection);
        world.spark.emit(global.eventerror, {rc: global.errcode_dbunavail, msg: global.text_nodbconnection, pdata: world.pdata});
      }
    }
  );
}

function ListProductsByCategory(world)
{
  var msg = '[' + world.eventname + '] ';
  // global.ConsoleLog('ListProductsByCategory');
  global.ConsoleLog(world.productcategoryid);
  // global.ConsoleLog(world.cn.custid);
  //
  global.pg.connect
  (
    global.cs,
    function(err, client, done)
    {
      if (!err)
      {
        var clause = __.isUndefined(world.showinactive) || __.isNull(world.showinactive) || (world.showinactive == 0) || (world.showinactive == '0') || !world.showinactive ? 'and p1.isactive=1 ' : '';
        //global.ConsoleLog('clause');
        //global.ConsoleLog(clause);
        client.query
        (
          'select ' +
          'p1.id,' +
          'p1.productcategories_id productcategoryid,' +
          'p1.code,' +
          'p1.altcode,' +
          'p1.barcode,' +
          'p1.name,' +
          'p1.notes,' +
          'p1.costprice,' +
          'p1.costgst,' +
          'p1.uom,' +
          'p1.uomsize,' +
          'p1.sale_uom,' +
          'p1.sale_uomsize,' +
          'p1.buildtemplateheaders_id buildtemplateid,' +
          'p1.minstockqty minqty,' +
          'p1.stockqtywarnthreshold warnqty,' +
          'p1.width,' +
          'p1.length,' +
          'p1.height,' +
          'p1.weight,' +
          'p1.price1,' +
          'p1.price2,' +
          'p1.price3,' +
          'p1.price4,' +
          'p1.price5,' +
          'p1.price6,' +
          'p1.price7,' +
          'p1.price8,' +
          'p1.price9,' +
          'p1.price10,' +
          'p1.price11,' +
          'p1.price12,' +
          'p1.attrib1,' +
          'p1.attrib2,' +
          'p1.attrib3,' +
          'p1.attrib4,' +
          'p1.attrib5,' +
          'p1.datecreated,' +
          'p1.datemodified,' +
          'pc1.code productcategorycode,' +
          'pc1.name productcategoryname,' +
          'p1.buytaxcodes_id buytaxcodeid,' +
          'p1.selltaxcodes_id selltaxcodeid,' +
          'p1.costofgoodsaccounts_id costofgoodsaccountid,' +
          'p1.incomeaccounts_id incomeaccountid,' +
          'p1.assetaccounts_id assetaccountid,' +
          'p1.isactive,' +
          'p1.productsalias_id productaliasid,' +
          'p1.locations1_id location1id,' +
          'p1.locations2_id location2id,' +
          'p1.clients_id clientid,' +
          'p1.inventoryqty,' +
          'getproductcountinopenorders($1,p1.id) orderqty,' +
          't1.name buytaxcode,' +
          't2.name selltaxcode,' +
          'a1.name saleaccount,' +
          'a2.name incomeaccount,' +
          'a3.name assetacount,' +
          'c1.price sellprice,' +
          'c1.gst sellgst,' +
          'u1.name usercreated,' +
          'u2.name usermodified ' +
          'from ' +
          'products p1 left join productcategories pc1 on (p1.productcategories_id=pc1.id) ' +
          '            left join pricing c1 on (p1.id=c1.products_id and c1.clients_id is null and c1.dateexpired is null) ' +
          '            left join taxcodes t1 on (p1.buytaxcodes_id=t1.id) ' +
          '            left join taxcodes t2 on (p1.selltaxcodes_id=t2.id) ' +
          '            left join accounts a1 on (p1.costofgoodsaccounts_id=a1.id) ' +
          '            left join accounts a2 on (p1.incomeaccounts_id=a2.id) ' +
          '            left join accounts a3 on (p1.assetaccounts_id=a3.id) ' +
          '            left join users u1 on (p1.userscreated_id=u1.id) ' +
          '            left join users u2 on (p1.usersmodified_id=u2.id) ' +
          'where ' +
          'p1.customers_id=$2 ' +
          clause +
          'and ' +
          'p1.productcategories_id=$3 ' +
          'and ' +
          'p1.dateexpired is null ' +
          'order by ' +
          'p1.code,' +
          'p1.name',
          [
            world.cn.custid,
            world.cn.custid,
            __.sanitiseAsBigInt(world.productcategoryid)
          ],
          function(err, result)
          {
            done();

            if (!err)
            {
              // JS returns date with TZ info/format, need in ISO format...
              result.rows.forEach
              (
                function(p)
                {
                  if (!__.isUndefined(p.notes) && !__.isNull(p.notes))
                    p.notes = __.unescapeHTML(p.notes);

                  if (!__.isUndefined(p.datemodified) && !__.isNull(p.datemodified))
                    p.datemodified = global.moment(p.datemodified).format('YYYY-MM-DD HH:mm:ss');

                  p.datecreated = global.moment(p.datecreated).format('YYYY-MM-DD HH:mm:ss');
                }
              );

              world.spark.emit(world.eventname, {rc: global.errcode_none, msg: global.text_success, fguid: world.fguid, rs: result.rows, pdata: world.pdata});
            }
            else
            {
              msg += global.text_generalexception + ' ' + err.message;
              global.log.error({listproductsbycategory: true}, msg);
              world.spark.emit(global.eventerror, {rc: global.errcode_fatal, msg: msg, pdata: world.pdata});
            }
          }
        );
      }
      else
      {
        global.log.error({listproductsbycategory: true}, global.text_nodbconnection);
        world.spark.emit(global.eventerror, {rc: global.errcode_dbunavail, msg: global.text_nodbconnection, pdata: world.pdata});
      }
    }
  );
}

function LoadProduct(world)
{
  var msg = '[' + world.eventname + '] ';
  //
  global.pg.connect
  (
    global.cs,
    function(err, client, done)
    {
      if (!err)
      {
        client.query
        (
          'select ' +
          'p1.id,' +
          'p1.productcategories_id productcategoryid,' +
          'p1.code,' +
          'p1.altcode,' +
          'p1.barcode,' +
          'p1.name,' +
          'p1.notes,' +
          'p1.costprice,' +
          'p1.costgst,' +
          'p1.uom,' +
          'p1.uomsize,' +
          'p1.sale_uom,' +
          'p1.sale_uomsize,' +
          'p1.buildtemplateheaders_id buildtemplateid,' +
          'p1.minstockqty minqty,' +
          'p1.stockqtywarnthreshold warnqty,' +
          'p1.width,' +
          'p1.length,' +
          'p1.height,' +
          'p1.weight,' +
          'p1.price1,' +
          'p1.price2,' +
          'p1.price3,' +
          'p1.price4,' +
          'p1.price5,' +
          'p1.price6,' +
          'p1.price7,' +
          'p1.price8,' +
          'p1.price9,' +
          'p1.price10,' +
          'p1.price11,' +
          'p1.price12,' +
          'p1.price13,' +
          'p1.price14,' +
          'p1.price15,' +
          'p1.attrib1,' +
          'p1.attrib2,' +
          'p1.attrib3,' +
          'p1.attrib4,' +
          'p1.attrib5,' +
          'p1.discountcode_id,' +
          'p1.listcode_id,' +
          'p1.datecreated,' +
          'p1.datemodified,' +
          'pc1.code productcategorycode,' +
          'pc1.name productcategoryname,' +
          'p1.buytaxcodes_id buytaxcodeid,' +
          'p1.selltaxcodes_id selltaxcodeid,' +
          'p1.costofgoodsaccounts_id costofgoodsaccountid,' +
          'p1.incomeaccounts_id incomeaccountid,' +
          'p1.assetaccounts_id assetaccountid,' +
          'p1.isactive,' +
          'p1.clients_id clientid,' +
          'p1.inventoryqty,' +
          'p1.productsalias_id productaliasid,' +
          'p1.locations1_id location1id,' +
          'p1.locations2_id location2id,' +
          't1.name buytaxcode,' +
          't2.name selltaxcode,' +
          'a1.name saleaccount,' +
          'a2.name incomeaccount,' +
          'a3.name assetacount,' +
          'u1.name usercreated,' +
          'u2.name usermodified ' +
          'from ' +
          'products p1 left join productcategories pc1 on (p1.productcategories_id=pc1.id) ' +
          '            left join taxcodes t1 on (p1.buytaxcodes_id=t1.id) ' +
          '            left join taxcodes t2 on (p1.selltaxcodes_id=t2.id) ' +
          '            left join accounts a1 on (p1.costofgoodsaccounts_id=a1.id) ' +
          '            left join accounts a2 on (p1.incomeaccounts_id=a2.id) ' +
          '            left join accounts a3 on (p1.assetaccounts_id=a3.id) ' +
          '            left join users u1 on (p1.userscreated_id=u1.id) ' +
          '            left join users u2 on (p1.usersmodified_id=u2.id) ' +
          'where ' +
          'p1.customers_id=$1 ' +
          'and ' +
          'p1.id=$2',
          [
            world.cn.custid,
            __.sanitiseAsBigInt(world.productid)
          ],
          function(err, result)
          {
            done();

            if (!err)
            {
              // JS returns date with TZ info/format, need in ISO format...
              result.rows.forEach
              (
                function(p)
                {
                  if (!__.isUndefined(p.notes) && !__.isNull(p.notes))
                    p.notes = __.unescapeHTML(p.notes);

                  if (!__.isUndefined(p.datemodified) && !__.isNull(p.datemodified))
                    p.datemodified = global.moment(p.datemodified).format('YYYY-MM-DD HH:mm:ss');

                  p.datecreated = global.moment(p.datecreated).format('YYYY-MM-DD HH:mm:ss');
                }
              );

              world.spark.emit(world.eventname, {rc: global.errcode_none, msg: global.text_success, fguid: world.fguid, product: result.rows[0], pdata: world.pdata});
            }
            else
            {
              msg += global.text_generalexception + ' ' + err.message;
              global.log.error({loadproduct: true}, msg);
              world.spark.emit(global.eventerror, {rc: global.errcode_fatal, msg: msg, pdata: world.pdata});
            }
          }
        );
      }
      else
      {
        global.log.error({loadproduct: true}, global.text_nodbconnection);
        world.spark.emit(global.eventerror, {rc: global.errcode_dbunavail, msg: global.text_nodbconnection, pdata: world.pdata});
      }
    }
  );
}

function NewProduct(world)
{
  var msg = '[' + world.eventname + '] ';
  //
  global.pg.connect
  (
    global.cs,
    function(err, client, done)
    {
      if (!err)
      {
        var tx = new global.pgtx(client);
        tx.begin
        (
          function(err)
          {
            if (!err)
            {
              doNewProduct(tx, world).then
              (
                function(result)
                {
                  tx.commit
                  (
                    function(err)
                    {
                      if (!err)
                      {
                        done();
                        world.spark.emit
                        (
                          world.eventname,
                          {
                            rc: global.errcode_none,
                            msg: global.text_success,
                            productid: result.productid,
                            productcategoryid: world.productcategoryid,
                            datecreated: result.datecreated,
                            usercreated: result.usercreated,
                            pdata: world.pdata
                          }
                        );
                        global.pr.sendToRoomExcept
                        (
                          global.custchannelprefix + world.cn.custid,
                          'productcreated',
                          {
                            productid: result.productid,
                            productcategoryid: world.productcategoryid,
                            datecreated: result.datecreated,
                            usercreated: result.usercreated
                          },
                          world.spark.id
                        );
                      }
                      else
                      {
                        tx.rollback
                        (
                          function(ignore)
                          {
                            done();
                            msg += global.text_tx + ' ' + err.message;
                            global.log.error({newproduct: true}, msg);
                            world.spark.emit(global.eventerror, {rc: global.errcode_dberr, msg: msg, pdata: world.pdata});
                          }
                        );
                      }
                    }
                  );
                }
              ).then
              (
                null,
                function(err)
                {
                  tx.rollback
                  (
                    function(ignore)
                    {
                      done();

                      msg += global.text_generalexception + ' ' + err.message;
                      global.log.error({newproduct: true}, msg);
                      world.spark.emit(global.eventerror, {rc: global.errcode_fatal, msg: msg, pdata: world.pdata});
                    }
                  );
                }
              );
            }
            else
            {
              done();
              msg += global.text_notxstart + ' ' + err.message;
              global.log.error({newproduct: true}, msg);
              world.spark.emit(global.eventerror, {rc: global.errcode_dberr, msg: msg, pdata: world.pdata});
            }
          }
        );
      }
      else
      {
        global.log.error({newproduct: true}, global.text_nodbconnection);
        world.spark.emit(global.eventerror, {rc: global.errcode_dbunavail, msg: global.text_nodbconnection, pdata: world.pdata});
      }
    }
  );
}

function SaveProduct(world)
{
  var msg = '[' + world.eventname + '] ';
  //
  global.pg.connect
  (
    global.cs,
    function(err, client, done)
    {
      if (!err)
      {
        var tx = new global.pgtx(client);
        tx.begin
        (
          function(err)
          {
            if (!err)
            {
              doSaveProduct(tx, world).then
              (
                function(result)
                {
                  tx.commit
                  (
                    function(err)
                    {
                      if (!err)
                      {
                        done();
                        world.spark.emit(world.eventname, {rc: global.errcode_none, msg: global.text_success, productid: world.productid, productcategoryid: result.productcategoryid, datemodified: result.datemodified, usermodified: result.usermodified, pdata: world.pdata});
                        global.pr.sendToRoomExcept(global.custchannelprefix + world.cn.custid, 'productsaved', {productid: result.productid, productcategoryid: result.productcategoryid, datemodified: result.datemodified, usermodified: result.usermodified}, world.spark.id);
                      }
                      else
                      {
                        tx.rollback
                        (
                          function(ignore)
                          {
                            done();
                            msg += global.text_tx + ' ' + err.message;
                            global.log.error({saveproduct: true}, msg);
                            world.spark.emit(global.eventerror, {rc: global.errcode_dberr, msg: msg, pdata: world.pdata});
                          }
                        );
                      }
                    }
                  );
                }
              ).then
              (
                null,
                function(err)
                {
                  tx.rollback
                  (
                    function(ignore)
                    {
                      done();

                      msg += global.text_generalexception + ' ' + err.message;
                      global.log.error({saveproduct: true}, msg);
                      world.spark.emit(global.eventerror, {rc: global.errcode_fatal, msg: msg, pdata: world.pdata});
                    }
                  );
                }
              );
            }
            else
            {
              done();
              msg += global.text_notxstart + ' ' + err.message;
              global.log.error({saveproduct: true}, msg);
              world.spark.emit(global.eventerror, {rc: global.errcode_dberr, msg: msg, pdata: world.pdata});
            }
          }
        );
      }
      else
      {
        global.log.error({saveproduct: true}, global.text_nodbconnection);
        world.spark.emit(global.eventerror, {rc: global.errcode_dbunavail, msg: global.text_nodbconnection, pdata: world.pdata});
      }
    }
  );
}

function ChangeProductCategory(world)
{
  var msg = '[' + world.eventname + '] ';
  //
  global.pg.connect
  (
    global.cs,
    function(err, client, done)
    {
      if (!err)
      {
        var tx = new global.pgtx(client);
        tx.begin
        (
          function(err)
          {
            if (!err)
            {
              doChangeProductCategory(tx, world).then
              (
                function(result)
                {
                  tx.commit
                  (
                    function(err)
                    {
                      if (!err)
                      {
                        done();
                        world.spark.emit(world.eventname, {rc: global.errcode_none, msg: global.text_success, productid: world.productid, productcategoryid: world.productcategoryid, datemodified: result.datemodified, usermodified: result.usermodified, pdata: world.pdata});
                        global.pr.sendToRoomExcept(global.custchannelprefix + world.cn.custid, 'productparentchanged', {productid: world.productid, productcategoryid: world.productcategoryid, datemodified: result.datemodified, usermodified: result.usermodified}, world.spark.id);
                      }
                      else
                      {
                        tx.rollback
                        (
                          function(ignore)
                          {
                            done();
                            msg += global.text_tx + ' ' + err.message;
                            global.log.error({changeproductparent: true}, msg);
                            world.spark.emit(global.eventerror, {rc: global.errcode_dberr, msg: msg, pdata: world.pdata});
                          }
                        );
                      }
                    }
                  );
                }
              ).then
              (
                null,
                function(err)
                {
                  tx.rollback
                  (
                    function(ignore)
                    {
                      done();

                      msg += global.text_generalexception + ' ' + err.message;
                      global.log.error({changeproductparent: true}, msg);
                      world.spark.emit(global.eventerror, {rc: global.errcode_fatal, msg: msg, pdata: world.pdata});
                    }
                  );
                }
              );
            }
            else
            {
              done();
              msg += global.text_notxstart + ' ' + err.message;
              global.log.error({changeproductparent: true}, msg);
              world.spark.emit(global.eventerror, {rc: global.errcode_dberr, msg: msg, pdata: world.pdata});
            }
          }
        );
      }
      else
      {
        global.log.error({changeproductparent: true}, global.text_nodbconnection);
        world.spark.emit(global.eventerror, {rc: global.errcode_dbunavail, msg: global.text_nodbconnection, pdata: world.pdata});
      }
    }
  );
}

function DuplicateProduct(world)
{
  var msg = '[' + world.eventname + '] ';
  //
  global.pg.connect
  (
    global.cs,
    function(err, client, done)
    {
      if (!err)
      {
        var tx = new global.pgtx(client);
        tx.begin
        (
          function(err)
          {
            if (!err)
            {
              doDuplicateProduct(tx, world).then
              (
                function(result)
                {
                  tx.commit
                  (
                    function(err)
                    {
                      if (!err)
                      {
                        done();
                        world.spark.emit
                        (
                          world.eventname,
                          {
                            rc: global.errcode_none,
                            msg: global.text_success,
                            productid: result.productid,
                            productcategoryid: result.productcategoryid,
                            code: result.code,
                            name: result.name,
                            datecreated: result.datecreated,
                            usercreated: result.usercreated,
                            pdata: world.pdata
                          }
                        );
                        global.pr.sendToRoomExcept
                        (
                          global.custchannelprefix + world.cn.custid,
                          'productcreated',
                          {
                            productid: result.productid,
                            productcategoryid: result.productcategoryid,
                            code: result.code,
                            name: result.name,
                            datecreated: result.datecreated,
                            usercreated: result.usercreated,
                          },
                          world.spark.id
                        );
                      }
                      else
                      {
                        tx.rollback
                        (
                          function(ignore)
                          {
                            done();
                            msg += global.text_tx + ' ' + err.message;
                            global.log.error({duplicateproduct: true}, msg);
                            world.spark.emit(global.eventerror, {rc: global.errcode_dberr, msg: msg, pdata: world.pdata});
                          }
                        );
                      }
                    }
                  );
                }
              ).then
              (
                null,
                function(err)
                {
                  tx.rollback
                  (
                    function(ignore)
                    {
                      done();

                      msg += global.text_generalexception + ' ' + err.message;
                      global.log.error({duplicateproduct: true}, msg);
                      world.spark.emit(global.eventerror, {rc: global.errcode_fatal, msg: msg, pdata: world.pdata});
                    }
                  );
                }
              );
            }
            else
            {
              done();
              msg += global.text_notxstart + ' ' + err.message;
              global.log.error({duplicateproduct: true}, msg);
              world.spark.emit(global.eventerror, {rc: global.errcode_dberr, msg: msg, pdata: world.pdata});
            }
          }
        );
      }
      else
      {
        global.log.error({duplicateproduct: true}, global.text_nodbconnection);
        world.spark.emit(global.eventerror, {rc: global.errcode_dbunavail, msg: global.text_nodbconnection, pdata: world.pdata});
      }
    }
  );
}

function CheckProductCode(world)
{
  var msg = '[' + world.eventname + '] ';
  //
  global.pg.connect
  (
    global.cs,
    function(err, client, done)
    {
      if (!err)
      {
        var binds = [world.cn.custid, __.sanitiseAsString(world.code), __.sanitiseAsString(world.code)];
        var clause = '';

        if (!__.isNull(world.productid))
        {
          clause = ' and p1.id!=$4';
          binds.push(world.productid);
        }

        client.query
        (
          'select ' +
          'p1.id,' +
          'p1.productcategories_id productcategoryid,' +
          'p1.altcode,' +
          'p1.code,' +
          'p1.name,' +
          'pk1.name productcategoryname ' +
          'from ' +
          'products p1 left join productcategories pk1 on (p1.productcategories_id=pk1.id) ' +
          '            left join productcodes pc1 on (p1.id=pc1.products_id) ' +
          'where ' +
          'p1.customers_id=$1 ' +
          'and ' +
          'p1.dateexpired is null ' +
          'and ' +
          'pc1.dateexpired is null ' +
          'and ' +
          '(' +
          'upper(p1.code)=upper($2) ' +
          'or ' +
          'upper(pc1.code)=upper($3)' +
          ') ' +
          clause,
          binds,
          function(err, result)
          {
            done();

            if (!err)
              world.spark.emit(world.eventname, {rc: global.errcode_none, msg: global.text_success, fguid: world.fguid, rs: result.rows, pdata: world.pdata});
            else
            {
              msg += global.text_generalexception + ' ' + err.message;
              global.log.error({checkproductcode: true}, msg);
              world.spark.emit(global.eventerror, {rc: global.errcode_fatal, msg: msg, pdata: world.pdata});
            }
          }
        );
      }
      else
      {
        global.log.error({checkproductcode: true}, global.text_nodbconnection);
        world.spark.emit(global.eventerror, {rc: global.errcode_dbunavail, msg: global.text_nodbconnection, pdata: world.pdata});
      }
    }
  );
}

function ExpireProduct(world)
{
  var msg = '[' + world.eventname + '] ';
  //
  global.pg.connect
  (
    global.cs,
    function(err, client, done)
    {
      if (!err)
      {
        var tx = new global.pgtx(client);
        tx.begin
        (
          function(err)
          {
            if (!err)
            {
              doExpireProduct(tx, world).then
              (
                function(result)
                {
                  tx.commit
                  (
                    function(err)
                    {
                      if (!err)
                      {
                        done();
                        world.spark.emit(world.eventname, {rc: global.errcode_none, msg: global.text_success, productid: world.productid, productcategoryid: result.productcategoryid, dateexpired: result.dateexpired, userexpired: result.userexpired, pdata: world.pdata});
                        global.pr.sendToRoomExcept(global.custchannelprefix + world.cn.custid, 'productexpired', {productid: world.productid, productcategoryid: result.productcategoryid, dateexpired: result.dateexpired, userexpired: result.userexpired}, world.spark.id);
                      }
                      else
                      {
                        tx.rollback
                        (
                          function(ignore)
                          {
                            done();
                            msg += global.text_tx + ' ' + err.message;
                            global.log.error({expireproduct: true}, msg);
                            world.spark.emit(global.eventerror, {rc: global.errcode_dberr, msg: msg, pdata: world.pdata});
                          }
                        );
                      }
                    }
                  );
                }
              ).then
              (
                null,
                function(err)
                {
                  tx.rollback
                  (
                    function(ignore)
                    {
                      done();

                      msg += global.text_generalexception + ' ' + err.message;
                      global.log.error({expireproduct: true}, msg);
                      world.spark.emit(global.eventerror, {rc: global.errcode_fatal, msg: msg, pdata: world.pdata});
                    }
                  );
                }
              );
            }
            else
            {
              done();
              msg += global.text_notxstart + ' ' + err.message;
              global.log.error({expireproduct: true}, msg);
              world.spark.emit(global.eventerror, {rc: global.errcode_dberr, msg: msg, pdata: world.pdata});
            }
          }
        );
      }
      else
      {
        global.log.error({expireproduct: true}, global.text_nodbconnection);
        world.spark.emit(global.eventerror, {rc: global.errcode_dbunavail, msg: global.text_nodbconnection, pdata: world.pdata});
      }
    }
  );
}

function SearchProducts(world)
{
  var msg = '[' + world.eventname + '] ';
  //
  global.pg.connect
  (
    global.cs,
    function(err, client, done)
    {
      if (!err)
      {
        var maxhistory = __.isUndefined(world.maxhistory) || __.isNull(world.maxhistory) ? 200 : world.maxhistory;
        var bindno = 2;
        var clauses = '';
        var value = world.value;
        var binds =
        [
          world.cn.custid
        ];

        if (!__.isUndefined(world.value) && !__.isNull(world.value) && !__.isBlank(world.value))
        {
          clauses += '((upper(p1.name) like upper($' + bindno++ + ')) or (upper(p1.code) like upper($' + bindno++ + ')) or (upper(p1.barcode) like upper($' + bindno++ + ')) or (upper(p1.attrib1) like upper($' + bindno++ + ')) or (upper(p1.attrib2) like upper($' + bindno++ + ')) or (upper(p1.attrib3) like upper($' + bindno++ + ')) or (upper(p1.attrib4) like upper($' + bindno++ + ')) or (upper(p1.attrib5) like upper($' + bindno++ + ')) or (upper(pc1.code) like upper($' + bindno++ + ')) or (upper(pc1.barcode) like upper($' + bindno++ + '))) and ';
          binds.push('%' + world.value + '%');
          binds.push('%' + world.value + '%');
          binds.push('%' + world.value + '%');
          binds.push('%' + world.value + '%');
          binds.push('%' + world.value + '%');
          binds.push('%' + world.value + '%');
          binds.push('%' + world.value + '%');
          binds.push('%' + world.value + '%');
          binds.push('%' + world.value + '%');
          binds.push('%' + world.value + '%');
        }

        // global.ConsoleLog("clauses: ");
        // global.ConsoleLog(clauses);
        

        // Any search criteria?
        if (bindno > 2)
        {
          // Lastly, make sure we don't end up with too many rows...
          binds.push(maxhistory);
          // global.ConsoleLog(binds);
          // global.ConsoleLog(bindno);
          client.query
          (
            'select ' +
            'p1.id,' +
            'p1.code,' +
            'p1.altcode,' +
            'p1.name,' +
            'p1.costprice,' +
            'p1.costgst,' +
            'p1.isactive,' +
            'pk1.id productcategoryid,' +
            'pk1.name productcategoryname ' +
            'from ' +
            'products p1 left join productcategories pk1 on (p1.productcategories_id=pk1.id) ' +
            '            left join productcodes pc1 on (p1.id=pc1.products_id) ' +
            'where ' +
            'p1.customers_id=$1 ' +
            'and ' +
            clauses +
            'p1.dateexpired is null ' +
            'order by ' +
            'p1.code,' +
            'p1.name ' +
            'limit $' + bindno,
            binds,
            function(err, result)
            {
              done();

              if (!err)
                world.spark.emit(world.eventname, {rc: global.errcode_none, msg: global.text_success, fguid: world.fguid, rs: result.rows, pdata: world.pdata});
              else
              {
                msg += global.text_generalexception + ' ' + err.message;
                global.log.error({searchproducts: true}, msg);
                world.spark.emit(global.eventerror, {rc: global.errcode_fatal, msg: msg, pdata: world.pdata});
              }
            }
          );
        }
        else
        {
          msg += global.text_nodata;
          global.log.error({searchproducts: true}, msg);
          world.spark.emit(global.eventerror, {rc: global.errcode_nodata, msg: msg, pdata: world.pdata});
        }
      }
      else
      {
        global.log.error({searchproducts: true}, global.text_nodbconnection);
        world.spark.emit(global.eventerror, {rc: global.errcode_dbunavail, msg: global.text_nodbconnection, pdata: world.pdata});
      }
    }
  );
}

function ListProductPricing(world)
{
  var msg = '[' + world.eventname + '] ';
  //
  global.pg.connect
  (
    global.cs,
    function(err, client, done)
    {
      if (!err)
      {
        client.query
        (
          'select ' +
          'p1.id,' +
          'p1.products_id productid,' +
          'p1.minqty,' +
          'p1.maxqty,' +
          'p1.price,' +
          'p1.gst,' +
          'p1.price1,' +
          'p1.gst1,' +
          'p1.price2,' +
          'p1.gst2,' +
          'p1.price3,' +
          'p1.gst3,' +
          'p1.price4,' +
          'p1.gst4,' +
          'p1.price5,' +
          'p1.gst5,' +
          'p1.notes,' +
          'p1.datefrom,' +
          'p1.dateto,' +
          'p1.datecreated,' +
          'p1.datemodified,' +
          'p1.clients_id clientid,' +
          'c1.name clientname,' +
          'u1.name usercreated,' +
          'u2.name usermodified ' +
          'from ' +
          'pricing p1 left join clients c1 on (p1.clients_id=c1.id) ' +
          '           left join users u1 on (p1.userscreated_id=u1.id) ' +
          '           left join users u2 on (p1.usersmodified_id=u2.id) ' +
          'where ' +
          'p1.customers_id=$1 ' +
          'and ' +
          'p1.products_id=$2 ' +
          'and ' +
          'p1.dateexpired is null ' +
          'order by ' +
          'c1.name,' +
          'p1.minqty,' +
          'p1.price',
          [
            world.cn.custid,
            __.sanitiseAsBigInt(world.productid)
          ],
          function(err, result)
          {
            done();

            if (!err)
            {
              // JS returns date with TZ info/format, need in ISO format...
              result.rows.forEach
              (
                function(p)
                {
                  if (!__.isUndefined(p.notes) && !__.isNull(p.notes))
                    p.notes = __.unescapeHTML(p.notes);

                  if (!__.isUndefined(p.datemodified) && !__.isNull(p.datemodified))
                    p.datemodified = global.moment(p.datemodified).format('YYYY-MM-DD HH:mm:ss');

                  p.datecreated = global.moment(p.datecreated).format('YYYY-MM-DD HH:mm:ss');
                }
              );

              world.spark.emit(world.eventname, {rc: global.errcode_none, msg: global.text_success, fguid: world.fguid, rs: result.rows, pdata: world.pdata});
            }
            else
            {
              msg += global.text_generalexception + ' ' + err.message;
              global.log.error({listproductpricing: true}, msg);
              world.spark.emit(global.eventerror, {rc: global.errcode_fatal, msg: msg, pdata: world.pdata});
            }
          }
        );
      }
      else
      {
        global.log.error({listproductpricing: true}, global.text_nodbconnection);
        world.spark.emit(global.eventerror, {rc: global.errcode_dbunavail, msg: global.text_nodbconnection, pdata: world.pdata});
      }
    }
  );
}

function NewProductPricing(world)
{
  var msg = '[' + world.eventname + '] ';
  //
  global.pg.connect
  (
    global.cs,
    function(err, client, done)
    {
      if (!err)
      {
        var tx = new global.pgtx(client);
        tx.begin
        (
          function(err)
          {
            if (!err)
            {
              doNewProductPricing(tx, world).then
              (
                function(result)
                {
                  tx.commit
                  (
                    function(err)
                    {
                      if (!err)
                      {
                        done();
                        world.spark.emit
                        (
                          world.eventname,
                          {
                            rc: global.errcode_none,
                            msg: global.text_success,
                            priceid: result.priceid,
                            productid: world.productid,
                            datecreated: result.datecreated,
                            usercreated: result.usercreated,
                            pdata: world.pdata
                          }
                        );
                        global.pr.sendToRoomExcept
                        (
                          global.custchannelprefix + world.cn.custid,
                          'productpricingcreated',
                          {
                            priceid: result.priceid,
                            productid: world.productid,
                            datecreated: result.datecreated,
                            usercreated: result.usercreated
                          },
                          world.spark.id
                        );
                      }
                      else
                      {
                        tx.rollback
                        (
                          function(ignore)
                          {
                            done();
                            msg += global.text_tx + ' ' + err.message;
                            global.log.error({newproductpricing: true}, msg);
                            world.spark.emit(global.eventerror, {rc: global.errcode_dberr, msg: msg, pdata: world.pdata});
                          }
                        );
                      }
                    }
                  );
                }
              ).then
              (
                null,
                function(err)
                {
                  tx.rollback
                  (
                    function(ignore)
                    {
                      done();

                      msg += global.text_generalexception + ' ' + err.message;
                      global.log.error({newproductpricing: true}, msg);
                      world.spark.emit(global.eventerror, {rc: global.errcode_fatal, msg: msg, pdata: world.pdata});
                    }
                  );
                }
              );
            }
            else
            {
              done();
              msg += global.text_notxstart + ' ' + err.message;
              global.log.error({newproductpricing: true}, msg);
              world.spark.emit(global.eventerror, {rc: global.errcode_dberr, msg: msg, pdata: world.pdata});
            }
          }
        );
      }
      else
      {
        global.log.error({newproductpricing: true}, global.text_nodbconnection);
        world.spark.emit(global.eventerror, {rc: global.errcode_dbunavail, msg: global.text_nodbconnection, pdata: world.pdata});
      }
    }
  );
}

function SaveProductPricing(world)
{
  var msg = '[' + world.eventname + '] ';
  //
  global.pg.connect
  (
    global.cs,
    function(err, client, done)
    {
      if (!err)
      {
        var tx = new global.pgtx(client);
        tx.begin
        (
          function(err)
          {
            if (!err)
            {
              doSaveProductPricing(tx, world).then
              (
                function(result)
                {
                  tx.commit
                  (
                    function(err)
                    {
                      if (!err)
                      {
                        done();
                        world.spark.emit(world.eventname, {rc: global.errcode_none, msg: global.text_success, priceid: world.priceid, productid: result.productid, datecreated: result.datecreated, usercreated: result.usercreated, pdata: world.pdata});
                        global.pr.sendToRoomExcept(global.custchannelprefix + world.cn.custid, 'productpricingsaved', {priceid: world.priceid, productid: result.productid, datecreated: result.datecreated, usercreated: result.usercreated}, world.spark.id);
                      }
                      else
                      {
                        tx.rollback
                        (
                          function(ignore)
                          {
                            done();
                            msg += global.text_tx + ' ' + err.message;
                            global.log.error({saveproductpricing: true}, msg);
                            world.spark.emit(global.eventerror, {rc: global.errcode_dberr, msg: msg, pdata: world.pdata});
                          }
                        );
                      }
                    }
                  );
                }
              ).then
              (
                null,
                function(err)
                {
                  tx.rollback
                  (
                    function(ignore)
                    {
                      done();

                      msg += global.text_generalexception + ' ' + err.message;
                      global.log.error({saveproductpricing: true}, msg);
                      world.spark.emit(global.eventerror, {rc: global.errcode_fatal, msg: msg, pdata: world.pdata});
                    }
                  );
                }
              );
            }
            else
            {
              done();
              msg += global.text_notxstart + ' ' + err.message;
              global.log.error({saveproductpricing: true}, msg);
              world.spark.emit(global.eventerror, {rc: global.errcode_dberr, msg: msg, pdata: world.pdata});
            }
          }
        );
      }
      else
      {
        global.log.error({saveproductpricing: true}, global.text_nodbconnection);
        world.spark.emit(global.eventerror, {rc: global.errcode_dbunavail, msg: global.text_nodbconnection, pdata: world.pdata});
      }
    }
  );
}

function ExpireProductPricing(world)
{
  var msg = '[' + world.eventname + '] ';
  //
  global.pg.connect
  (
    global.cs,
    function(err, client, done)
    {
      if (!err)
      {
        var tx = new global.pgtx(client);
        tx.begin
        (
          function(err)
          {
            if (!err)
            {
              doExpireProductPricing(tx, world).then
              (
                function(result)
                {
                  tx.commit
                  (
                    function(err)
                    {
                      if (!err)
                      {
                        done();
                        world.spark.emit(world.eventname, {rc: global.errcode_none, msg: global.text_success, priceid: world.priceid, productid: result.productid, datecreated: result.datecreated, usercreated: result.usercreated, pdata: world.pdata});
                        global.pr.sendToRoomExcept(global.custchannelprefix + world.cn.custid, 'productpricingexpired', {priceid: world.priceid, productid: result.productid, datecreated: result.datecreated, usercreated: result.usercreated}, world.spark.id);
                      }
                      else
                      {
                        tx.rollback
                        (
                          function(ignore)
                          {
                            done();
                            msg += global.text_tx + ' ' + err.message;
                            global.log.error({expireproductpricing: true}, msg);
                            world.spark.emit(global.eventerror, {rc: global.errcode_dberr, msg: msg, pdata: world.pdata});
                          }
                        );
                      }
                    }
                  );
                }
              ).then
              (
                null,
                function(err)
                {
                  tx.rollback
                  (
                    function(ignore)
                    {
                      done();

                      msg += global.text_generalexception + ' ' + err.message;
                      global.log.error({expireproductpricing: true}, msg);
                      world.spark.emit(global.eventerror, {rc: global.errcode_fatal, msg: msg, pdata: world.pdata});
                    }
                  );
                }
              );
            }
            else
            {
              done();
              msg += global.text_notxstart + ' ' + err.message;
              global.log.error({expireproductpricing: true}, msg);
              world.spark.emit(global.eventerror, {rc: global.errcode_dberr, msg: msg, pdata: world.pdata});
            }
          }
        );
      }
      else
      {
        global.log.error({expireproductpricing: true}, global.text_nodbconnection);
        world.spark.emit(global.eventerror, {rc: global.errcode_dbunavail, msg: global.text_nodbconnection, pdata: world.pdata});
      }
    }
  );
}

function ListProductTemplates(world)
{
  var msg = '[' + world.eventname + '] ';
  //
  global.pg.connect
  (
    global.cs,
    function(err, client, done)
    {
      if (!err)
      {
        client.query
        (
          'select ' +
          'p1.id,' +
          'p1.name,' +
          'p1.code,' +
          'p1.price,' +
          'p1.gst,' +
          'p1.qty,' +
          'p1.taxcodes_id taxcodeid,' +
          't1.name taxcode,' +
          'p2.id parentid,' +
          'p2.name parentname,' +
          'c1.id clientid,' +
          'c1.name clientname,' +
          'p1.datecreated,' +
          'p1.datemodified,' +
          'u1.name usercreated,' +
          'u2.name usermodified,' +
          'getnumproductsintemplate($1,p1.id) numproducts,' +
          'gettotalcostpricefromproducttemplate($2,p1.id) totalprice,' +
          'p1.totalgst ' +
          'from ' +
          'producttemplateheaders p1 left join producttemplateheaders p2 on (p1.producttemplateheaders_id=p2.id) ' +
          '                          left join taxcodes t1 on (p1.taxcodes_id=t1.id) ' +
          '                          left join clients c1 on (p1.clients_id=c1.id) ' +
          '                          left join users u1 on (p1.userscreated_id=u1.id) ' +
          '                          left join users u2 on (p1.usersmodified_id=u2.id) ' +
          'where ' +
          'p1.customers_id=$3 ' +
          'and ' +
          'p1.dateexpired is null ' +
          'order by ' +
          'p1.path,' +
          'p2.id desc,' +
          'p1.code',
          [
            world.cn.custid,
            world.cn.custid,
            world.cn.custid
          ],
          function(err, result)
          {
            done();

            if (!err)
            {
              // JS returns date with TZ info/format, need in ISO format...
              result.rows.forEach
              (
                function(p)
                {
                  if (!__.isUndefined(p.datemodified) && !__.isNull(p.datemodified))
                    p.datemodified = global.moment(p.datemodified).format('YYYY-MM-DD HH:mm:ss');

                  p.datecreated = global.moment(p.datecreated).format('YYYY-MM-DD HH:mm:ss');
                }
              );

              world.spark.emit(world.eventname, {rc: global.errcode_none, msg: global.text_success, fguid: world.fguid, rs: result.rows, pdata: world.pdata});
            }
            else
            {
              msg += global.text_generalexception + ' ' + err.message;
              global.log.error({listproducttemplates: true}, msg);
              world.spark.emit(global.eventerror, {rc: global.errcode_fatal, msg: msg, pdata: world.pdata});
            }
          }
        );
      }
      else
      {
        global.log.error({listproducttemplates: true}, global.text_nodbconnection);
        world.spark.emit(global.eventerror, {rc: global.errcode_dbunavail, msg: global.text_nodbconnection, pdata: world.pdata});
      }
    }
  );
}

function NewProductTemplate(world)
{
  var msg = '[' + world.eventname + '] ';
  //
  global.pg.connect
  (
    global.cs,
    function(err, client, done)
    {
      if (!err)
      {
        var tx = new global.pgtx(client);
        tx.begin
        (
          function(err)
          {
            if (!err)
            {
              global.modhelpers.NewUniqueCode(tx, world.cn.custid).then
              (
                function(newcode)
                {
                  world.newcode = newcode;
                  return doNewProductTemplate(tx, world);
                }
              ).then
              (
                function(result)
                {
                  tx.commit
                  (
                    function(err)
                    {
                      if (!err)
                      {
                        done();
                        world.spark.emit
                        (
                          world.eventname,
                          {
                            rc: global.errcode_none,
                            msg: global.text_success,
                            producttemplateid: result.producttemplateid,
                            parentid: world.parentid,
                            datecreated: result.datecreated,
                            usercreated: result.usercreated,
                            pdata: world.pdata
                          }
                        );
                        global.pr.sendToRoomExcept
                        (
                          global.custchannelprefix + world.cn.custid,
                          'producttemplatecreated',
                          {
                            producttemplateid: result.producttemplateid,
                            parentid: world.parentid,
                            datecreated: result.datecreated,
                            usercreated: result.usercreated
                          },
                          world.spark.id
                        );
                      }
                      else
                      {
                        tx.rollback
                        (
                          function(ignore)
                          {
                            done();
                            msg += global.text_tx + ' ' + err.message;
                            global.log.error({newproducttemplate: true}, msg);
                            world.spark.emit(global.eventerror, {rc: global.errcode_dberr, msg: msg, pdata: world.pdata});
                          }
                        );
                      }
                    }
                  );
                }
              ).then
              (
                null,
                function(err)
                {
                  tx.rollback
                  (
                    function(ignore)
                    {
                      done();

                      msg += global.text_generalexception + ' ' + err.message;
                      global.log.error({newproducttemplate: true}, msg);
                      world.spark.emit(global.eventerror, {rc: global.errcode_fatal, msg: msg, pdata: world.pdata});
                    }
                  );
                }
              );
            }
            else
            {
              done();
              msg += global.text_notxstart + ' ' + err.message;
              global.log.error({newproducttemplate: true}, msg);
              world.spark.emit(global.eventerror, {rc: global.errcode_dberr, msg: msg, pdata: world.pdata});
            }
          }
        );
      }
      else
      {
        global.log.error({newproducttemplate: true}, global.text_nodbconnection);
        world.spark.emit(global.eventerror, {rc: global.errcode_dbunavail, msg: global.text_nodbconnection, pdata: world.pdata});
      }
    }
  );
}

function SaveProductTemplate(world)
{
  var msg = '[' + world.eventname + '] ';
  //
  global.pg.connect
  (
    global.cs,
    function(err, client, done)
    {
      if (!err)
      {
        var tx = new global.pgtx(client);
        tx.begin
        (
          function(err)
          {
            if (!err)
            {
              doSaveProductTemplate(tx, world).then
              (
                function(result)
                {
                  tx.commit
                  (
                    function(err)
                    {
                      if (!err)
                      {
                        done();
                        world.spark.emit(world.eventname, {rc: global.errcode_none, msg: global.text_success, producttemplateid: world.producttemplateid, datemodified: result.datemodified, usermodified: result.usermodified, pdata: world.pdata});
                        global.pr.sendToRoomExcept(global.custchannelprefix + world.cn.custid, 'producttemplatesaved', {producttemplateid: world.producttemplateid, datemodified: result.datemodified, usermodified: result.usermodified}, world.spark.id);
                      }
                      else
                      {
                        tx.rollback
                        (
                          function(ignore)
                          {
                            done();
                            msg += global.text_tx + ' ' + err.message;
                            global.log.error({saveproducttemplate: true}, msg);
                            world.spark.emit(global.eventerror, {rc: global.errcode_dberr, msg: msg, pdata: world.pdata});
                          }
                        );
                      }
                    }
                  );
                }
              ).then
              (
                null,
                function(err)
                {
                  tx.rollback
                  (
                    function(ignore)
                    {
                      done();

                      msg += global.text_generalexception + ' ' + err.message;
                      global.log.error({saveproducttemplate: true}, msg);
                      world.spark.emit(global.eventerror, {rc: global.errcode_fatal, msg: msg, pdata: world.pdata});
                    }
                  );
                }
              );
            }
            else
            {
              done();
              msg += global.text_notxstart + ' ' + err.message;
              global.log.error({saveproducttemplate: true}, msg);
              world.spark.emit(global.eventerror, {rc: global.errcode_dberr, msg: msg, pdata: world.pdata});
            }
          }
        );
      }
      else
      {
        global.log.error({saveproducttemplate: true}, global.text_nodbconnection);
        world.spark.emit(global.eventerror, {rc: global.errcode_dbunavail, msg: global.text_nodbconnection, pdata: world.pdata});
      }
    }
  );
}

function ChangeProductTemplateParent(world)
{
  var msg = '[' + world.eventname + '] ';
  //
  global.pg.connect
  (
    global.cs,
    function(err, client, done)
    {
      if (!err)
      {
        var tx = new global.pgtx(client);
        tx.begin
        (
          function(err)
          {
            if (!err)
            {
              doChangeProductTemplateParent(tx, world).then
              (
                function(result)
                {
                  tx.commit
                  (
                    function(err)
                    {
                      if (!err)
                      {
                        done();
                        world.spark.emit(world.eventname, {rc: global.errcode_none, msg: global.text_success, producttemplateid: world.producttemplateid, parentid: world.parentid, datemodified: result.datemodified, usermodified: result.usermodified, pdata: world.pdata});
                        global.pr.sendToRoomExcept(global.custchannelprefix + world.cn.custid, 'producttemplateparentchanged', {producttemplateid: world.producttemplateid, parentid: world.parentid, datemodified: result.datemodified, usermodified: result.usermodified}, world.spark.id);
                      }
                      else
                      {
                        tx.rollback
                        (
                          function(ignore)
                          {
                            done();
                            msg += global.text_tx + ' ' + err.message;
                            global.log.error({changeproducttemplateparent: true}, msg);
                            world.spark.emit(global.eventerror, {rc: global.errcode_dberr, msg: msg, pdata: world.pdata});
                          }
                        );
                      }
                    }
                  );
                }
              ).then
              (
                null,
                function(err)
                {
                  tx.rollback
                  (
                    function(ignore)
                    {
                      done();

                      msg += global.text_generalexception + ' ' + err.message;
                      global.log.error({changeproducttemplateparent: true}, msg);
                      world.spark.emit(global.eventerror, {rc: global.errcode_fatal, msg: msg, pdata: world.pdata});
                    }
                  );
                }
              );
            }
            else
            {
              done();
              msg += global.text_notxstart + ' ' + err.message;
              global.log.error({changeproducttemplateparent: true}, msg);
              world.spark.emit(global.eventerror, {rc: global.errcode_dberr, msg: msg, pdata: world.pdata});
            }
          }
        );
      }
      else
      {
        global.log.error({changeproducttemplateparent: true}, global.text_nodbconnection);
        world.spark.emit(global.eventerror, {rc: global.errcode_dbunavail, msg: global.text_nodbconnection, pdata: world.pdata});
      }
    }
  );
}

function ChangeBuildTemplateParent(world)
{
  var msg = '[' + world.eventname + '] ';
  //
  global.pg.connect
  (
    global.cs,
    function(err, client, done)
    {
      if (!err)
      {
        var tx = new global.pgtx(client);
        tx.begin
        (
          function(err)
          {
            if (!err)
            {
              doChangeBuildTemplateParent(tx, world).then
              (
                function(result)
                {
                  tx.commit
                  (
                    function(err)
                    {
                      if (!err)
                      {
                        done();
                        world.spark.emit(world.eventname, {rc: global.errcode_none, msg: global.text_success, buildtemplateid: world.buildtemplateid, parentid: world.parentid, datemodified: result.datemodified, usermodified: result.usermodified, pageNumber : world.pageNumber, pdata: world.pdata});
                        global.pr.sendToRoomExcept(global.custchannelprefix + world.cn.custid, 'buildtemplateparentchanged', {buildtemplateid: world.buildtemplateid, parentid: world.parentid, datemodified: result.datemodified, usermodified: result.usermodified}, world.spark.id);
                      }
                      else
                      {
                        tx.rollback
                        (
                          function(ignore)
                          {
                            done();
                            msg += global.text_tx + ' ' + err.message;
                            global.log.error({changebuildtemplateparent: true}, msg);
                            world.spark.emit(global.eventerror, {rc: global.errcode_dberr, msg: msg, pdata: world.pdata});
                          }
                        );
                      }
                    }
                  );
                }
              ).then
              (
                null,
                function(err)
                {
                  tx.rollback
                  (
                    function(ignore)
                    {
                      done();

                      msg += global.text_generalexception + ' ' + err.message;
                      global.log.error({changebuildtemplateparent: true}, msg);
                      world.spark.emit(global.eventerror, {rc: global.errcode_fatal, msg: msg, pdata: world.pdata});
                    }
                  );
                }
              );
            }
            else
            {
              done();
              msg += global.text_notxstart + ' ' + err.message;
              global.log.error({changebuildtemplateparent: true}, msg);
              world.spark.emit(global.eventerror, {rc: global.errcode_dberr, msg: msg, pdata: world.pdata});
            }
          }
        );
      }
      else
      {
        global.log.error({changebuildtemplateparent: true}, global.text_nodbconnection);
        world.spark.emit(global.eventerror, {rc: global.errcode_dbunavail, msg: global.text_nodbconnection, pdata: world.pdata});
      }
    }
  );
}

function ExpireProductTemplate(world)
{
  var msg = '[' + world.eventname + '] ';
  //
  global.pg.connect
  (
    global.cs,
    function(err, client, done)
    {
      if (!err)
      {
        var tx = new global.pgtx(client);
        tx.begin
        (
          function(err)
          {
            if (!err)
            {
              // If cascade is true, we just expire this template and trigger will expire all children...
              // Otherwise...
              // First find parent of this template (which could be null if no parent)
              // Set that as new parent of immediate children - their subschildren will be updated by triggers
              // Finally expire this template
              //
              // Note if we expire this template first, children and subschildren will autoexpire by the triggers
              doExpireProductTemplateStep1(tx, world).then
              (
                function(ignore)
                {
                  return doExpireProductTemplateStep2(tx, world);
                }
              ).then
              (
                function(result)
                {
                  tx.commit
                  (
                    function(err)
                    {
                      if (!err)
                      {
                        done();
                        world.spark.emit(world.eventname, {rc: global.errcode_none, msg: global.text_success, producttemplateid: world.producttemplateid, dateexpired: result.dateexpired, userexpired: result.userexpired, pdata: world.pdata});
                        global.pr.sendToRoomExcept(global.custchannelprefix + world.cn.custid, 'producttemplateexpired', {producttemplateid: world.producttemplateid, dateexpired: result.dateexpired, userexpired: result.userexpired}, world.spark.id);
                      }
                      else
                      {
                        tx.rollback
                        (
                          function(ignore)
                          {
                            done();
                            msg += global.text_tx + ' ' + err.message;
                            global.log.error({expireproducttemplate: true}, msg);
                            world.spark.emit(global.eventerror, {rc: global.errcode_dberr, msg: msg, pdata: world.pdata});
                          }
                        );
                      }
                    }
                  );
                }
              ).then
              (
                null,
                function(err)
                {
                  tx.rollback
                  (
                    function(ignore)
                    {
                      done();

                      msg += global.text_generalexception + ' ' + err.message;
                      global.log.error({expireproducttemplate: true}, msg);
                      world.spark.emit(global.eventerror, {rc: global.errcode_fatal, msg: msg, pdata: world.pdata});
                    }
                  );
                }
              );
            }
            else
            {
              done();
              msg += global.text_notxstart + ' ' + err.message;
              global.log.error({expireproducttemplate: true}, msg);
              world.spark.emit(global.eventerror, {rc: global.errcode_dberr, msg: msg, pdata: world.pdata});
            }
          }
        );
      }
      else
      {
        global.log.error({expireproducttemplate: true}, global.text_nodbconnection);
        world.spark.emit(global.eventerror, {rc: global.errcode_dbunavail, msg: global.text_nodbconnection, pdata: world.pdata});
      }
    }
  );
}

function ExpireBuildTemplate(world)
{
  var msg = '[' + world.eventname + '] ';
  //
  global.pg.connect
  (
    global.cs,
    function(err, client, done)
    {
      if (!err)
      {
        var tx = new global.pgtx(client);
        tx.begin
        (
          function(err)
          {
            if (!err)
            {
              // If cascade is true, we just expire this template and trigger will expire all children...
              // Otherwise...
              // First find parent of this template (which could be null if no parent)
              // Set that as new parent of immediate children - their subschildren will be updated by triggers
              // Finally expire this template
              //
              // Note if we expire this template first, children and subschildren will autoexpire by the triggers
              doExpireBuildTemplateStep1(tx, world).then
              (
                function(ignore)
                {
                  return doExpireBuildTemplateStep2(tx, world);
                }
              ).then
              (
                function(result)
                {
                  tx.commit
                  (
                    function(err)
                    {
                      if (!err)
                      {
                        done();
                        world.spark.emit(world.eventname, {rc: global.errcode_none, msg: global.text_success, buildtemplateid: world.buildtemplateid, dateexpired: result.dateexpired, userexpired: result.userexpired, pdata: world.pdata});
                        global.pr.sendToRoomExcept(global.custchannelprefix + world.cn.custid, 'buildtemplateexpired', {buildtemplateid: world.buildtemplateid, dateexpired: result.dateexpired, userexpired: result.userexpired}, world.spark.id);
                      }
                      else
                      {
                        tx.rollback
                        (
                          function(ignore)
                          {
                            done();
                            msg += global.text_tx + ' ' + err.message;
                            global.log.error({expirebuildtemplate: true}, msg);
                            world.spark.emit(global.eventerror, {rc: global.errcode_dberr, msg: msg, pdata: world.pdata});
                          }
                        );
                      }
                    }
                  );
                }
              ).then
              (
                null,
                function(err)
                {
                  tx.rollback
                  (
                    function(ignore)
                    {
                      done();

                      msg += global.text_generalexception + ' ' + err.message;
                      global.log.error({expirebuildtemplate: true}, msg);
                      world.spark.emit(global.eventerror, {rc: global.errcode_fatal, msg: msg, pdata: world.pdata});
                    }
                  );
                }
              );
            }
            else
            {
              done();
              msg += global.text_notxstart + ' ' + err.message;
              global.log.error({expirebuildtemplate: true}, msg);
              world.spark.emit(global.eventerror, {rc: global.errcode_dberr, msg: msg, pdata: world.pdata});
            }
          }
        );
      }
      else
      {
        global.log.error({expirebuildtemplate: true}, global.text_nodbconnection);
        world.spark.emit(global.eventerror, {rc: global.errcode_dbunavail, msg: global.text_nodbconnection, pdata: world.pdata});
      }
    }
  );
}

function DuplicateProductTemplate(world)
{
  var msg = '[' + world.eventname + '] ';
  //
  global.pg.connect
  (
    global.cs,
    function(err, client, done)
    {
      if (!err)
      {
        var tx = new global.pgtx(client);
        tx.begin
        (
          function(err)
          {
            if (!err)
            {
              global.modhelpers.NewUniqueCode(tx, world.cn.custid).then
              (
                function(newcode)
                {
                  world.newcode = newcode;
                  return doDuplicateProductTemplate(tx, world);
                }
              ).then
              (
                function(producttemplateid)
                {
                  tx.commit
                  (
                    function(err)
                    {
                      if (!err)
                      {
                        done();
                        world.spark.emit(world.eventname, {rc: global.errcode_none, msg: global.text_success, producttemplateid: producttemplateid, pdata: world.pdata});
                        global.pr.sendToRoomExcept(global.custchannelprefix + world.cn.custid, 'producttemplateduplicated', {producttemplateid: producttemplateid}, world.spark.id);
                      }
                      else
                      {
                        tx.rollback
                        (
                          function(ignore)
                          {
                            done();
                            msg += global.text_tx + ' ' + err.message;
                            global.log.error({duplicateproducttemplate: true}, msg);
                            world.spark.emit(global.eventerror, {rc: global.errcode_dberr, msg: msg, pdata: world.pdata});
                          }
                        );
                      }
                    }
                  );
                }
              ).then
              (
                null,
                function(err)
                {
                  tx.rollback
                  (
                    function(ignore)
                    {
                      done();

                      msg += global.text_generalexception + ' ' + err.message;
                      global.log.error({duplicateproducttemplate: true}, msg);
                      world.spark.emit(global.eventerror, {rc: global.errcode_fatal, msg: msg, pdata: world.pdata});
                    }
                  );
                }
              );
            }
            else
            {
              done();
              msg += global.text_notxstart + ' ' + err.message;
              global.log.error({duplicateproducttemplate: true}, msg);
              world.spark.emit(global.eventerror, {rc: global.errcode_dberr, msg: msg, pdata: world.pdata});
            }
          }
        );
      }
      else
      {
        global.log.error({duplicateproducttemplate: true}, global.text_nodbconnection);
        world.spark.emit(global.eventerror, {rc: global.errcode_dbunavail, msg: global.text_nodbconnection, pdata: world.pdata});
      }
    }
  );
}

function DuplicateBuildTemplate(world)
{
  var msg = '[' + world.eventname + '] ';
  //
  global.pg.connect
  (
    global.cs,
    function(err, client, done)
    {
      if (!err)
      {
        var tx = new global.pgtx(client);
        tx.begin
        (
          function(err)
          {
            if (!err)
            {
              global.modhelpers.NewUniqueCode(tx, world.cn.custid).then
              (
                function(newcode)
                {
                  world.newcode = newcode;
                  return doDuplicateBuildTemplate(tx, world);
                }
              ).then
              (
                function(buildtemplateid)
                {
                  tx.commit
                  (
                    function(err)
                    {
                      if (!err)
                      {
                        done();
                        world.spark.emit(world.eventname, {rc: global.errcode_none, msg: global.text_success, buildtemplateid: buildtemplateid, pdata: world.pdata});
                        global.pr.sendToRoomExcept(global.custchannelprefix + world.cn.custid, 'buildtemplateduplicated', {buildtemplateid: buildtemplateid}, world.spark.id);
                      }
                      else
                      {
                        tx.rollback
                        (
                          function(ignore)
                          {
                            done();
                            msg += global.text_tx + ' ' + err.message;
                            global.log.error({duplicatebuildtemplate: true}, msg);
                            world.spark.emit(global.eventerror, {rc: global.errcode_dberr, msg: msg, pdata: world.pdata});
                          }
                        );
                      }
                    }
                  );
                }
              ).then
              (
                null,
                function(err)
                {
                  tx.rollback
                  (
                    function(ignore)
                    {
                      done();

                      msg += global.text_generalexception + ' ' + err.message;
                      global.log.error({duplicatebuildtemplate: true}, msg);
                      world.spark.emit(global.eventerror, {rc: global.errcode_fatal, msg: msg, pdata: world.pdata});
                    }
                  );
                }
              );
            }
            else
            {
              done();
              msg += global.text_notxstart + ' ' + err.message;
              global.log.error({duplicatebuildtemplate: true}, msg);
              world.spark.emit(global.eventerror, {rc: global.errcode_dberr, msg: msg, pdata: world.pdata});
            }
          }
        );
      }
      else
      {
        global.log.error({duplicatebuildtemplate: true}, global.text_nodbconnection);
        world.spark.emit(global.eventerror, {rc: global.errcode_dbunavail, msg: global.text_nodbconnection, pdata: world.pdata});
      }
    }
  );
}

function SyncProductTemplate(world)
{
  var msg = '[' + world.eventname + '] ';
  //
  global.pg.connect
  (
    global.cs,
    function(err, client, done)
    {
      if (!err)
      {
        var tx = new global.pgtx(client);
        tx.begin
        (
          function(err)
          {
            if (!err)
            {
              doSyncProductTemplate(tx, world).then
              (
                function(ignore)
                {
                  tx.commit
                  (
                    function(err)
                    {
                      if (!err)
                      {
                        done();
                        world.spark.emit(world.eventname, {rc: global.errcode_none, msg: global.text_success, producttemplateid: world.producttemplateid, pdata: world.pdata});
                        global.pr.sendToRoomExcept(global.custchannelprefix + world.cn.custid, 'producttemplatesynced', {producttemplateid: world.producttemplateid}, world.spark.id);
                      }
                      else
                      {
                        tx.rollback
                        (
                          function(ignore)
                          {
                            done();
                            msg += global.text_tx + ' ' + err.message;
                            global.log.error({syncproducttemplate: true}, msg);
                            world.spark.emit(global.eventerror, {rc: global.errcode_dberr, msg: msg, pdata: world.pdata});
                          }
                        );
                      }
                    }
                  );
                }
              ).then
              (
                null,
                function(err)
                {
                  tx.rollback
                  (
                    function(ignore)
                    {
                      done();

                      msg += global.text_generalexception + ' ' + err.message;
                      global.log.error({syncproducttemplate: true}, msg);
                      world.spark.emit(global.eventerror, {rc: global.errcode_fatal, msg: msg, pdata: world.pdata});
                    }
                  );
                }
              );
            }
            else
            {
              done();
              msg += global.text_notxstart + ' ' + err.message;
              global.log.error({syncproducttemplate: true}, msg);
              world.spark.emit(global.eventerror, {rc: global.errcode_dberr, msg: msg, pdata: world.pdata});
            }
          }
        );
      }
      else
      {
        global.log.error({syncproducttemplate: true}, global.text_nodbconnection);
        world.spark.emit(global.eventerror, {rc: global.errcode_dbunavail, msg: global.text_nodbconnection, pdata: world.pdata});
      }
    }
  );
}

function SyncBuildTemplate(world)
{
  var msg = '[' + world.eventname + '] ';
  //
  global.pg.connect
  (
    global.cs,
    function(err, client, done)
    {
      if (!err)
      {
        var tx = new global.pgtx(client);
        tx.begin
        (
          function(err)
          {
            if (!err)
            {
              doSyncBuildTemplate(tx, world).then
              (
                function(ignore)
                {
                  tx.commit
                  (
                    function(err)
                    {
                      if (!err)
                      {
                        done();
                        world.spark.emit(world.eventname, {rc: global.errcode_none, msg: global.text_success, buildtemplateid: world.buildtemplateid, pdata: world.pdata});
                        global.pr.sendToRoomExcept(global.custchannelprefix + world.cn.custid, 'buildtemplatesynced', {buildtemplateid: world.buildtemplateid}, world.spark.id);
                      }
                      else
                      {
                        tx.rollback
                        (
                          function(ignore)
                          {
                            done();
                            msg += global.text_tx + ' ' + err.message;
                            global.log.error({syncbuildtemplate: true}, msg);
                            world.spark.emit(global.eventerror, {rc: global.errcode_dberr, msg: msg, pdata: world.pdata});
                          }
                        );
                      }
                    }
                  );
                }
              ).then
              (
                null,
                function(err)
                {
                  tx.rollback
                  (
                    function(ignore)
                    {
                      done();

                      msg += global.text_generalexception + ' ' + err.message;
                      global.log.error({syncbuildtemplate: true}, msg);
                      world.spark.emit(global.eventerror, {rc: global.errcode_fatal, msg: msg, pdata: world.pdata});
                    }
                  );
                }
              );
            }
            else
            {
              done();
              msg += global.text_notxstart + ' ' + err.message;
              global.log.error({syncbuildtemplate: true}, msg);
              world.spark.emit(global.eventerror, {rc: global.errcode_dberr, msg: msg, pdata: world.pdata});
            }
          }
        );
      }
      else
      {
        global.log.error({syncbuildtemplate: true}, global.text_nodbconnection);
        world.spark.emit(global.eventerror, {rc: global.errcode_dbunavail, msg: global.text_nodbconnection, pdata: world.pdata});
      }
    }
  );
}

function SyncBuildTemplatesToMaster(world)
{
  var msg = '[' + world.eventname + '] ';
  //
  global.pg.connect
  (
    global.cs,
    function(err, client, done)
    {
      if (!err)
      {
        var tx = new global.pgtx(client);
        tx.begin
        (
          function(err)
          {
            if (!err)
            {
              doSyncBuildTemplatesToMasters(tx, world).then
              (
                function(ignore)
                {
                  tx.commit
                  (
                    function(err)
                    {
                      if (!err)
                      {
                        done();
                        world.spark.emit(world.eventname, {rc: global.errcode_none, msg: global.text_success, pdata: world.pdata});
                        global.pr.sendToRoomExcept(global.custchannelprefix + world.cn.custid, 'buildtemplatesyncedtomaster', {}, world.spark.id);
                      }
                      else
                      {
                        tx.rollback
                        (
                          function(ignore)
                          {
                            done();
                            msg += global.text_tx + ' ' + err.message;
                            global.log.error({syncbuildtemplatestomaster: true}, msg);
                            world.spark.emit(global.eventerror, {rc: global.errcode_dberr, msg: msg, pdata: world.pdata});
                          }
                        );
                      }
                    }
                  );
                }
              ).then
              (
                null,
                function(err)
                {
                  tx.rollback
                  (
                    function(ignore)
                    {
                      done();

                      msg += global.text_generalexception + ' ' + err.message;
                      global.log.error({syncbuildtemplatestomaster: true}, msg);
                      world.spark.emit(global.eventerror, {rc: global.errcode_fatal, msg: msg, pdata: world.pdata});
                    }
                  );
                }
              );
            }
            else
            {
              done();
              msg += global.text_notxstart + ' ' + err.message;
              global.log.error({syncbuildtemplatestomaster: true}, msg);
              world.spark.emit(global.eventerror, {rc: global.errcode_dberr, msg: msg, pdata: world.pdata});
            }
          }
        );
      }
      else
      {
        global.log.error({syncbuildtemplatestomaster: true}, global.text_nodbconnection);
        world.spark.emit(global.eventerror, {rc: global.errcode_dbunavail, msg: global.text_nodbconnection, pdata: world.pdata});
      }
    }
  );
}

function SearchBuildTemplates(world)
{
  // var msg = '[' + world.eventname + '] ';
  // //
  // global.pg.connect
  // (
  //   global.cs,
  //   function(err, client, done)
  //   {
  //     if (!err)
  //     {
  //       var maxhistory = __.isUndefined(world.maxhistory) || __.isNull(world.maxhistory) ? 200 : world.maxhistory;
  //       var bindno = 2;
  //       var clauses = '';
  //       var value = world.value;
  //       var binds =
  //       [
  //         world.cn.custid
  //       ];

  //       if (!__.isUndefined(world.value) && !__.isNull(world.value) && !__.isBlank(world.value))
  //       {
  //         clauses += '((upper(bth1.name) like upper($' + bindno++ + ')) or (upper(bth1.code) like upper($' + bindno++ + '))) and ';
  //         binds.push('%' + world.value + '%');
  //         binds.push('%' + world.value + '%');
  //       }

  //       // Any search criteria?
  //       if (bindno > 2)
  //       {
  //         // Lastly, make sure we don't end up with too many rows...
  //         binds.push(maxhistory);

  //         client.query
  //         (
  //           'select ' +
  //           'bth1.id,' +
  //           'bth1.code,' +
  //           'bth1.name ' +
  //           'from ' +
  //           'buildtemplateheaders bth1 ' +
  //           'where ' +
  //           'bth1.customers_id=$1 ' +
  //           'and ' +
  //           clauses +
  //           'bth1.dateexpired is null ' +
  //           'and ' +
  //           'bth1.buildtemplateheaders_id is null ' +
  //           'order by ' +
  //           'bth1.code,' +
  //           'bth1.name ' +
  //           'limit $' + bindno,
  //           binds,
  //           function(err, result)
  //           {
  //             done();

  //             if (!err)
  //               world.spark.emit(world.eventname, {rc: global.errcode_none, msg: global.text_success, fguid: world.fguid, rs: result.rows, pdata: world.pdata});
  //             else
  //             {
  //               msg += global.text_generalexception + ' ' + err.message;
  //               global.log.error({searchproducts: true}, msg);
  //               world.spark.emit(global.eventerror, {rc: global.errcode_fatal, msg: msg, pdata: world.pdata});
  //             }
  //           }
  //         );
  //       }
  //       else
  //       {
  //         msg += global.text_nodata;
  //         global.log.error({searchproducts: true}, msg);
  //         world.spark.emit(global.eventerror, {rc: global.errcode_nodata, msg: msg, pdata: world.pdata});
  //       }
  //     }
  //     else
  //     {
  //       global.log.error({searchproducts: true}, global.text_nodbconnection);
  //       world.spark.emit(global.eventerror, {rc: global.errcode_dbunavail, msg: global.text_nodbconnection, pdata: world.pdata});
  //     }
  //   }
  // );
}

function BuildProductTemplate(world)
{
  var msg = '[' + world.eventname + '] ';
  //
  global.pg.connect
  (
    global.cs,
    function(err, client, done)
    {
      if (!err)
      {
        var tx = new global.pgtx(client);
        tx.begin
        (
          function(err)
          {
            if (!err)
            {
              var header = {};
              var products = [];
              var config = {};
              var inventoryid = null;

              // Get costs/prices...
              doGetProductTemplateHeader(tx, world).then
              (
                function(result)
                {
                  header = result;
                  // Get current and required quantities...
                  return doGetProductTemplateDetails(tx, world);
                }
              ).then
              (
                function(result)
                {
                  products = result;
                  // Need to get inventory adjustment account from cache... inventoryadjustaccountid
                  return global.getCustConfig(world.cn.custid);
                }
              ).then
              (
                function(result)
                {
                  config = result;
                  return doProductTemplateUpdateInventory(tx, products, world.cn.custid, world.cn.userid);
                }
              ).then
              (
                function(ignore)
                {
                  return doProductTemplateAddInventory(tx, world, header, config);
                }
              ).then
              (
                function(result)
                {
                  inventoryid = result;
                  return doProductTemplateBuildAddPricing(tx, world, header, config);
                }
              ).then
              (
                function(result)
                {
                  tx.commit
                  (
                    function(err)
                    {
                      if (!err)
                      {
                        done();
                        world.spark.emit(world.eventname, {rc: global.errcode_none, msg: global.text_success, pdata: world.pdata});

                        global.pr.sendToRoom(global.custchannelprefix + world.cn.custid, 'producttemplatebuilt', {producttemplateid: world.producttemplateid, productid: world.productid});
                        global.pr.sendToRoom(global.custchannelprefix + world.cn.custid, 'productsaved', {productid: world.productid});
                      }
                      else
                      {
                        tx.rollback
                        (
                          function(ignore)
                          {
                            done();
                            msg += global.text_tx + ' ' + err.message;
                            global.log.error({buildproducttemplate: true}, msg);
                            world.spark.emit(global.eventerror, {rc: global.errcode_dberr, msg: msg, pdata: world.pdata});
                          }
                        );
                      }
                    }
                  );
                }
              ).then
              (
                null,
                function(err)
                {
                  tx.rollback
                  (
                    function(ignore)
                    {
                      var rc = global.errcode_fatal;

                      done();

                      if (!__.isUndefined(err.rc))
                      {
                        rc = err.rc;
                        msg += err.message;
                      }
                      else
                        msg += global.text_generalexception + ' ' + err.message;

                      global.log.error({buildproducttemplate: true}, msg);
                      world.spark.emit(global.eventerror, {rc: rc, msg: msg, pdata: world.pdata});
                    }
                  );
                }
              );
            }
            else
            {
              done();
              msg += global.text_notxstart + ' ' + err.message;
              global.log.error({buildproducttemplate: true}, msg);
              world.spark.emit(global.eventerror, {rc: global.errcode_dberr, msg: msg, pdata: world.pdata});
            }
          }
        );
      }
      else
      {
        global.log.error({buildproducttemplate: true}, global.text_nodbconnection);
        world.spark.emit(global.eventerror, {rc: global.errcode_dbunavail, msg: global.text_nodbconnection, pdata: world.pdata});
      }
    }
  );
}

function ListProductsByTemplate(world)
{
  var msg = '[' + world.eventname + '] ';
  //
  global.pg.connect
  (
    global.cs,
    function(err, client, done)
    {
      if (!err)
      {
        client.query
        (
          'select ' +
          'p1.id,' +
          'p1.products_id productid,' +
          'p1.taxcodes_id taxcodeid,' +
          'p1.pricing_id pricingid,' +
          'p2.name productname,' +
          'p2.code productcode,' +
          'p2.costprice price,' +
          'p2.costgst gst,' +
          'p2.productcategories_id productcategoryid,' +
          'p1.qty,' +
          'p1.pertemplateqty,' +
          'p1.datecreated,' +
          'p1.datemodified,' +
          'u1.name usercreated,' +
          'u2.name usermodified ' +
          'from ' +
          'producttemplatedetails p1 left join products p2 on (p1.products_id=p2.id) ' +
          '                          left join users u1 on (p1.userscreated_id=u1.id) ' +
          '                          left join users u2 on (p1.usersmodified_id=u2.id) ' +
          'where ' +
          'p1.customers_id=$1 ' +
          'and ' +
          'p1.dateexpired is null ' +
          'and ' +
          'p1.producttemplateheaders_id=$2 ' +
          'order by ' +
          'p2.code,' +
          'p2.name',
          [
            world.cn.custid,
            __.sanitiseAsBigInt(world.producttemplateid)
          ],
          function(err, result)
          {
            done();

            if (!err)
            {
              // JS returns date with TZ info/format, need in ISO format...
              result.rows.forEach
              (
                function(p)
                {
                  if (!__.isUndefined(p.datemodified) && !__.isNull(p.datemodified))
                    p.datemodified = global.moment(p.datemodified).format('YYYY-MM-DD HH:mm:ss');

                  p.datecreated = global.moment(p.datecreated).format('YYYY-MM-DD HH:mm:ss');
                }
              );

              world.spark.emit(world.eventname, {rc: global.errcode_none, msg: global.text_success, fguid: world.fguid, rs: result.rows, pdata: world.pdata});
            }
            else
            {
              msg += global.text_generalexception + ' ' + err.message;
              global.log.error({listproductsbytemplate: true}, msg);
              world.spark.emit(global.eventerror, {rc: global.errcode_fatal, msg: msg, pdata: world.pdata});
            }
          }
        );
      }
      else
      {
        global.log.error({listproductsbytemplate: true}, global.text_nodbconnection);
        world.spark.emit(global.eventerror, {rc: global.errcode_dbunavail, msg: global.text_nodbconnection, pdata: world.pdata});
      }
    }
  );
}

function ListProductsByBuildTemplate(world)
{
  var msg = '[' + world.eventname + '] ';
  //
  global.pg.connect
  (
    global.cs,
    function(err, client, done)
    {
      if (!err)
      {
        client.query
        (
          'select ' +
          'p1.id,' +
          'p1.products_id productid,' +
          'p1.taxcodes_id taxcodeid,' +
          'p1.pricing_id pricingid,' +
          'p2.name productname,' +
          'p2.code productcode,' +
          'p2.costprice price,' +
          'p2.costgst gst,' +
          'p2.productcategories_id productcategoryid,' +
          'p1.qty,' +
          'p1.pertemplateqty,' +
          'p1.datecreated,' +
          'p1.datemodified,' +
          'u1.name usercreated,' +
          'u2.name usermodified ' +
          'from ' +
          'buildtemplatedetails p1 left join products p2 on (p1.products_id=p2.id) ' +
          '                        left join users u1 on (p1.userscreated_id=u1.id) ' +
          '                        left join users u2 on (p1.usersmodified_id=u2.id) ' +
          'where ' +
          'p1.customers_id=$1 ' +
          'and ' +
          'p1.dateexpired is null ' +
          'and ' +
          'p1.buildtemplateheaders_id=$2 ' +
          'order by ' +
          'p2.code,' +
          'p2.name',
          [
            world.cn.custid,
            __.sanitiseAsBigInt(world.buildtemplateid)
          ],
          function(err, result)
          {
            done();

            if (!err)
            {
              // JS returns date with TZ info/format, need in ISO format...
              result.rows.forEach
              (
                function(p)
                {
                  if (!__.isUndefined(p.datemodified) && !__.isNull(p.datemodified))
                    p.datemodified = global.moment(p.datemodified).format('YYYY-MM-DD HH:mm:ss');

                  p.datecreated = global.moment(p.datecreated).format('YYYY-MM-DD HH:mm:ss');
                }
              );

              world.spark.emit(world.eventname, {rc: global.errcode_none, msg: global.text_success, fguid: world.fguid, rs: result.rows, pdata: world.pdata});
            }
            else
            {
              msg += global.text_generalexception + ' ' + err.message;
              global.log.error({listproductsbybuildtemplate: true}, msg);
              world.spark.emit(global.eventerror, {rc: global.errcode_fatal, msg: msg, pdata: world.pdata});
            }
          }
        );
      }
      else
      {
        global.log.error({listproductsbybuildtemplate: true}, global.text_nodbconnection);
        world.spark.emit(global.eventerror, {rc: global.errcode_dbunavail, msg: global.text_nodbconnection, pdata: world.pdata});
      }
    }
  );
}

function ListProductsForBuild(world)
{
  var msg = '[' + world.eventname + '] ';
  //
  global.pg.connect
  (
    global.cs,
    function(err, client, done)
    {
      if (!err)
      {
        client.query
        (
          'select ' +
          'p1.products_id productid,' +
          'p2.code productcode,' +
          'p2.name productname,' +
          'p1.qty,' +
          'p1.pertemplateqty ' +
          'from ' +
          'buildtemplatedetails p1 left join products p2 on (p1.products_id=p2.id) ' +
          'where ' +
          'p1.customers_id=$1 ' +
          'and ' +
          'p1.dateexpired is null ' +
          'and ' +
          'p1.buildtemplateheaders_id=$2 ' +
          'order by ' +
          'p2.name',
          [
            world.cn.custid,
            __.sanitiseAsBigInt(world.buildtemplateid)
          ],
          function(err, result)
          {
            done();

            if (!err)
              world.spark.emit(world.eventname, {rc: global.errcode_none, msg: global.text_success, fguid: world.fguid, rs: result.rows, pdata: world.pdata});
            else
            {
              msg += global.text_generalexception + ' ' + err.message;
              global.log.error({listproductsforbuild: true}, msg);
              world.spark.emit(global.eventerror, {rc: global.errcode_fatal, msg: msg, pdata: world.pdata});
            }
          }
        );
      }
      else
      {
        global.log.error({listproductsforbuild: true}, global.text_nodbconnection);
        world.spark.emit(global.eventerror, {rc: global.errcode_dbunavail, msg: global.text_nodbconnection, pdata: world.pdata});
      }
    }
  );
}

function NewProductTemplateDetail(world)
{
  var msg = '[' + world.eventname + '] ';
  //
  global.pg.connect
  (
    global.cs,
    function(err, client, done)
    {
      if (!err)
      {
        var tx = new global.pgtx(client);
        tx.begin
        (
          function(err)
          {
            if (!err)
            {
              doNewProductTemplateDetail(tx, world).then
              (
                function(result)
                {
                  tx.commit
                  (
                    function(err)
                    {
                      if (!err)
                      {
                        done();
                        world.spark.emit
                        (
                          world.eventname,
                          {
                            rc: global.errcode_none,
                            msg: global.text_success,
                            producttemplatedetailid: result.producttemplatedetailid,
                            producttemplateid: world.producttemplateid,
                            datecreated: result.datecreated,
                            usercreated: result.usercreated,
                            pdata: world.pdata
                          }
                        );
                        global.pr.sendToRoomExcept
                        (
                          global.custchannelprefix + world.cn.custid,
                          'producttemplatedetailcreated',
                          {
                            producttemplatedetailid: result.producttemplatedetailid,
                            producttemplateid: world.producttemplateid,
                            datecreated: result.datecreated,
                            usercreated: result.usercreated
                          },
                          world.spark.id
                        );
                      }
                      else
                      {
                        tx.rollback
                        (
                          function(ignore)
                          {
                            done();
                            msg += global.text_tx + ' ' + err.message;
                            global.log.error({newproducttemplatedetail: true}, msg);
                            world.spark.emit(global.eventerror, {rc: global.errcode_dberr, msg: msg, pdata: world.pdata});
                          }
                        );
                      }
                    }
                  );
                }
              ).then
              (
                null,
                function(err)
                {
                  tx.rollback
                  (
                    function(ignore)
                    {
                      done();

                      msg += global.text_generalexception + ' ' + err.message;
                      global.log.error({newproducttemplatedetail: true}, msg);
                      world.spark.emit(global.eventerror, {rc: global.errcode_fatal, msg: msg, pdata: world.pdata});
                    }
                  );
                }
              );
            }
            else
            {
              done();
              msg += global.text_notxstart + ' ' + err.message;
              global.log.error({newproducttemplatedetail: true}, msg);
              world.spark.emit(global.eventerror, {rc: global.errcode_dberr, msg: msg, pdata: world.pdata});
            }
          }
        );
      }
      else
      {
        global.log.error({newproducttemplatedetail: true}, global.text_nodbconnection);
        world.spark.emit(global.eventerror, {rc: global.errcode_dbunavail, msg: global.text_nodbconnection, pdata: world.pdata});
      }
    }
  );
}

function NewBuildTemplateDetail(world)
{
  var msg = '[' + world.eventname + '] ';
  //
  global.pg.connect
  (
    global.cs,
    function(err, client, done)
    {
      if (!err)
      {
        var tx = new global.pgtx(client);
        tx.begin
        (
          function(err)
          {
            if (!err)
            {
              doNewBuildTemplateDetail(tx, world).then
              (
                function(result)
                {
                  tx.commit
                  (
                    function(err)
                    {
                      if (!err)
                      {
                        done();
                        world.spark.emit
                        (
                          world.eventname,
                          {
                            rc: global.errcode_none,
                            msg: global.text_success,
                            buildtemplatedetailid: result.buildtemplatedetailid,
                            buildtemplateid: world.buildtemplateid,
                            datecreated: result.datecreated,
                            usercreated: result.usercreated,
                            pdata: world.pdata
                          }
                        );
                        global.pr.sendToRoomExcept
                        (
                          global.custchannelprefix + world.cn.custid,
                          'buildtemplatedetailcreated',
                          {
                            buildtemplatedetailid: result.buildtemplatedetailid,
                            buildtemplateid: world.buildtemplateid,
                            datecreated: result.datecreated,
                            usercreated: result.usercreated
                          },
                          world.spark.id
                        );
                      }
                      else
                      {
                        tx.rollback
                        (
                          function(ignore)
                          {
                            done();
                            msg += global.text_tx + ' ' + err.message;
                            global.log.error({newbuildtemplatedetail: true}, msg);
                            world.spark.emit(global.eventerror, {rc: global.errcode_dberr, msg: msg, pdata: world.pdata});
                          }
                        );
                      }
                    }
                  );
                }
              ).then
              (
                null,
                function(err)
                {
                  tx.rollback
                  (
                    function(ignore)
                    {
                      done();

                      msg += global.text_generalexception + ' ' + err.message;
                      global.log.error({newbuildtemplatedetail: true}, msg);
                      world.spark.emit(global.eventerror, {rc: global.errcode_fatal, msg: msg, pdata: world.pdata});
                    }
                  );
                }
              );
            }
            else
            {
              done();
              msg += global.text_notxstart + ' ' + err.message;
              global.log.error({newbuildtemplatedetail: true}, msg);
              world.spark.emit(global.eventerror, {rc: global.errcode_dberr, msg: msg, pdata: world.pdata});
            }
          }
        );
      }
      else
      {
        global.log.error({newbuildtemplatedetail: true}, global.text_nodbconnection);
        world.spark.emit(global.eventerror, {rc: global.errcode_dbunavail, msg: global.text_nodbconnection, pdata: world.pdata});
      }
    }
  );
}

function SaveProductTemplateDetail(world)
{
  var msg = '[' + world.eventname + '] ';
  //
  global.pg.connect
  (
    global.cs,
    function(err, client, done)
    {
      if (!err)
      {
        var tx = new global.pgtx(client);
        tx.begin
        (
          function(err)
          {
            if (!err)
            {
              doSaveProductTemplateDetail(tx, world).then
              (
                function(result)
                {
                  tx.commit
                  (
                    function(err)
                    {
                      if (!err)
                      {
                        done();
                        world.spark.emit(world.eventname, {rc: global.errcode_none, msg: global.text_success, producttemplateid: result.producttemplateid, producttemplatedetailid: result.producttemplatedetailid, datemodified: result.datemodified, usermodified: result.usermodified, pdata: world.pdata});
                        global.pr.sendToRoomExcept(global.custchannelprefix + world.cn.custid, 'producttemplatedetailsaved', {producttemplateid: result.producttemplateid, producttemplatedetailid: result.producttemplatedetailid, datemodified: result.datemodified, usermodified: result.usermodified}, world.spark.id);
                      }
                      else
                      {
                        tx.rollback
                        (
                          function(ignore)
                          {
                            done();
                            msg += global.text_tx + ' ' + err.message;
                            global.log.error({saveproducttemplatedetail: true}, msg);
                            world.spark.emit(global.eventerror, {rc: global.errcode_dberr, msg: msg, pdata: world.pdata});
                          }
                        );
                      }
                    }
                  );
                }
              ).then
              (
                null,
                function(err)
                {
                  tx.rollback
                  (
                    function(ignore)
                    {
                      done();

                      msg += global.text_generalexception + ' ' + err.message;
                      global.log.error({saveproducttemplatedetail: true}, msg);
                      world.spark.emit(global.eventerror, {rc: global.errcode_fatal, msg: msg, pdata: world.pdata});
                    }
                  );
                }
              );
            }
            else
            {
              done();
              msg += global.text_notxstart + ' ' + err.message;
              global.log.error({saveproducttemplatedetail: true}, msg);
              world.spark.emit(global.eventerror, {rc: global.errcode_dberr, msg: msg, pdata: world.pdata});
            }
          }
        );
      }
      else
      {
        global.log.error({saveproducttemplatedetail: true}, global.text_nodbconnection);
        world.spark.emit(global.eventerror, {rc: global.errcode_dbunavail, msg: global.text_nodbconnection, pdata: world.pdata});
      }
    }
  );
}

function SaveBuildTemplateDetail(world)
{
  var msg = '[' + world.eventname + '] ';
  //
  global.pg.connect
  (
    global.cs,
    function(err, client, done)
    {
      if (!err)
      {
        var tx = new global.pgtx(client);
        tx.begin
        (
          function(err)
          {
            if (!err)
            {
              doSaveBuildTemplateDetail(tx, world).then
              (
                function(result)
                {
                  tx.commit
                  (
                    function(err)
                    {
                      if (!err)
                      {
                        done();
                        world.spark.emit(world.eventname, {rc: global.errcode_none, msg: global.text_success, buildtemplateid: result.buildtemplateid, buildtemplatedetailid: result.buildtemplatedetailid, datemodified: result.datemodified, usermodified: result.usermodified, pdata: world.pdata});
                        global.pr.sendToRoomExcept(global.custchannelprefix + world.cn.custid, 'buildtemplatedetailsaved', {buildtemplateid: result.buildtemplateid, buildtemplatedetailid: result.buildtemplatedetailid, datemodified: result.datemodified, usermodified: result.usermodified}, world.spark.id);
                      }
                      else
                      {
                        tx.rollback
                        (
                          function(ignore)
                          {
                            done();
                            msg += global.text_tx + ' ' + err.message;
                            global.log.error({savebuildtemplatedetail: true}, msg);
                            world.spark.emit(global.eventerror, {rc: global.errcode_dberr, msg: msg, pdata: world.pdata});
                          }
                        );
                      }
                    }
                  );
                }
              ).then
              (
                null,
                function(err)
                {
                  tx.rollback
                  (
                    function(ignore)
                    {
                      done();

                      msg += global.text_generalexception + ' ' + err.message;
                      global.log.error({savebuildtemplatedetail: true}, msg);
                      world.spark.emit(global.eventerror, {rc: global.errcode_fatal, msg: msg, pdata: world.pdata});
                    }
                  );
                }
              );
            }
            else
            {
              done();
              msg += global.text_notxstart + ' ' + err.message;
              global.log.error({savebuildtemplatedetail: true}, msg);
              world.spark.emit(global.eventerror, {rc: global.errcode_dberr, msg: msg, pdata: world.pdata});
            }
          }
        );
      }
      else
      {
        global.log.error({savebuildtemplatedetail: true}, global.text_nodbconnection);
        world.spark.emit(global.eventerror, {rc: global.errcode_dbunavail, msg: global.text_nodbconnection, pdata: world.pdata});
      }
    }
  );
}

function ExpireProductTemplateDetail(world)
{
  var msg = '[' + world.eventname + '] ';
  //
  global.pg.connect
  (
    global.cs,
    function(err, client, done)
    {
      if (!err)
      {
        var tx = new global.pgtx(client);
        tx.begin
        (
          function(err)
          {
            if (!err)
            {
              doExpireProductTemplateDetail(tx, world).then
              (
                function(result)
                {
                  tx.commit
                  (
                    function(err)
                    {
                      if (!err)
                      {
                        done();
                        world.spark.emit(world.eventname, {rc: global.errcode_none, msg: global.text_success, producttemplatedetailid: world.producttemplatedetailid, producttemplateid: result.producttemplateid, dateexpired: result.dateexpired, userexpired: result.userexpired, pdata: world.pdata});
                        global.pr.sendToRoomExcept(global.custchannelprefix + world.cn.custid, 'producttemplatedetailexpired', {producttemplatedetailid: world.producttemplatedetailid, producttemplateid: result.producttemplateid, dateexpired: result.dateexpired, userexpired: result.userexpired}, world.spark.id);
                      }
                      else
                      {
                        tx.rollback
                        (
                          function(ignore)
                          {
                            done();
                            msg += global.text_tx + ' ' + err.message;
                            global.log.error({expireproducttemplatedetail: true}, msg);
                            world.spark.emit(global.eventerror, {rc: global.errcode_dberr, msg: msg, pdata: world.pdata});
                          }
                        );
                      }
                    }
                  );
                }
              ).then
              (
                null,
                function(err)
                {
                  tx.rollback
                  (
                    function(ignore)
                    {
                      done();

                      msg += global.text_generalexception + ' ' + err.message;
                      global.log.error({expireproducttemplatedetail: true}, msg);
                      world.spark.emit(global.eventerror, {rc: global.errcode_fatal, msg: msg, pdata: world.pdata});
                    }
                  );
                }
              );
            }
            else
            {
              done();
              msg += global.text_notxstart + ' ' + err.message;
              global.log.error({expireproducttemplatedetail: true}, msg);
              world.spark.emit(global.eventerror, {rc: global.errcode_dberr, msg: msg, pdata: world.pdata});
            }
          }
        );
      }
      else
      {
        global.log.error({expireproducttemplatedetail: true}, global.text_nodbconnection);
        world.spark.emit(global.eventerror, {rc: global.errcode_dbunavail, msg: global.text_nodbconnection, pdata: world.pdata});
      }
    }
  );
}

function ExpireBuildTemplateDetail(world)
{
  var msg = '[' + world.eventname + '] ';
  //
  global.pg.connect
  (
    global.cs,
    function(err, client, done)
    {
      if (!err)
      {
        var tx = new global.pgtx(client);
        tx.begin
        (
          function(err)
          {
            if (!err)
            {
              doExpireBuildTemplateDetail(tx, world).then
              (
                function(result)
                {
                  tx.commit
                  (
                    function(err)
                    {
                      if (!err)
                      {
                        done();
                        world.spark.emit(world.eventname, {rc: global.errcode_none, msg: global.text_success, buildtemplatedetailid: world.buildtemplatedetailid, buildtemplateid: result.buildtemplateid, dateexpired: result.dateexpired, userexpired: result.userexpired, pdata: world.pdata});
                        global.pr.sendToRoomExcept(global.custchannelprefix + world.cn.custid, 'buildtemplatedetailexpired', {buildtemplatedetailid: world.buildtemplatedetailid, buildtemplateid: result.buildtemplateid, dateexpired: result.dateexpired, userexpired: result.userexpired}, world.spark.id);
                      }
                      else
                      {
                        tx.rollback
                        (
                          function(ignore)
                          {
                            done();
                            msg += global.text_tx + ' ' + err.message;
                            global.log.error({expirebuildtemplatedetail: true}, msg);
                            world.spark.emit(global.eventerror, {rc: global.errcode_dberr, msg: msg, pdata: world.pdata});
                          }
                        );
                      }
                    }
                  );
                }
              ).then
              (
                null,
                function(err)
                {
                  tx.rollback
                  (
                    function(ignore)
                    {
                      done();

                      msg += global.text_generalexception + ' ' + err.message;
                      global.log.error({expirebuildtemplatedetail: true}, msg);
                      world.spark.emit(global.eventerror, {rc: global.errcode_fatal, msg: msg, pdata: world.pdata});
                    }
                  );
                }
              );
            }
            else
            {
              done();
              msg += global.text_notxstart + ' ' + err.message;
              global.log.error({expirebuildtemplatedetail: true}, msg);
              world.spark.emit(global.eventerror, {rc: global.errcode_dberr, msg: msg, pdata: world.pdata});
            }
          }
        );
      }
      else
      {
        global.log.error({expirebuildtemplatedetail: true}, global.text_nodbconnection);
        world.spark.emit(global.eventerror, {rc: global.errcode_dbunavail, msg: global.text_nodbconnection, pdata: world.pdata});
      }
    }
  );
}

function GetProductPrices(world)
{
  var msg = '[' + world.eventname + '] ';
  global.ConsoleLog(msg);
  global.ConsoleLog("Get Product Prices");
  //
  global.pg.connect
  (
    global.cs,
    function(err, client, done)
    {
      if (!err)
      {
        // Order with client pricing first...
        client.query
        (
          'select ' +
          'p1.id,' +
          'p1.clients_id clientid,' +
          'p2.uomsize,' +
          'p2.costprice,' +
          'p2.costgst,' +
          'p2.price1,' +
          'p2.price2,' +
          'p2.price3,' +
          'p2.price4,' +
          'p2.price5,' +
          'p2.price6,' +
          'p2.price7,' +
          'p2.price8,' +
          'p2.price9,' +
          'p2.price10,' +
          'p2.price11,' +
          'p2.price12,' +
          '(p1.price / p2.uomsize) unitprice,' +
          '(p1.gst / p2.uomsize) unitgst,' +
          '(p1.price1 / p2.uomsize) unitprice1,' +
          '(p1.gst1 / p2.uomsize) unitgst1,' +
          '(p1.price2 / p2.uomsize) unitprice2,' +
          '(p1.gst2 / p2.uomsize) unitgst2,' +
          '(p1.price3 / p2.uomsize) unitprice3,' +
          '(p1.gst3 / p2.uomsize) unitgst3,' +
          '(p1.price4 / p2.uomsize) unitprice4,' +
          '(p1.gst4 / p2.uomsize) unitgst4,' +
          '(p1.price5 / p2.uomsize) unitprice5,' +
          '(p1.gst5 / p2.uomsize) unitgst5,' +
          'case when p1.minqty=0.0000 then null else p1.minqty end,' +
          'case when p1.maxqty=0.0000 then null else p1.maxqty end ' +
          'from ' +
          'products p2 left join pricing p1 on (p2.id=p1.products_id)' +
          'where ' +
          'p2.customers_id=$1 ' +
          'and ' +
          'p2.id=$2 ' +
          'and ' +
          'p1.dateexpired is null ' +
          'order by ' +
          'p1.clients_id desc,' +
          'p1.minqty,' +
          'p1.maxqty,' +
          'p1.price',
          [
            world.cn.custid,
            __.sanitiseAsBigInt(world.productid)
          ],
          function(err, result)
          {
            done();

            if (!err)
              world.spark.emit(world.eventname, {rc: global.errcode_none, msg: global.text_success, fguid: world.fguid, rs: result.rows, pdata: world.pdata});
            else
            {
              msg += global.text_generalexception + ' ' + err.message;
              global.log.error({getproductprices: true}, msg);
              world.spark.emit(global.eventerror, {rc: global.errcode_fatal, msg: msg, pdata: world.pdata});
            }
          }
        );
      }
      else
      {
        global.log.error({getproductprices: true}, global.text_nodbconnection);
        world.spark.emit(global.eventerror, {rc: global.errcode_dbunavail, msg: global.text_nodbconnection, pdata: world.pdata});
      }
    }
  );
}

function GetPrice(world)
{
  var msg = '[' + world.eventname + '] ';
  // global.ConsoleLog(msg);
  // global.ConsoleLog("Get Price");
  //
  global.pg.connect
  (
    global.cs,
    function(err, client, done)
    {
      if (!err)
      {
        // Order with client pricing first...
        client.query
        (
          'select ' +
          'p1.id,' +
          'p1.clients_id clientid,' +
          'p1.price,' +
          'p1.gst,' +
          'p1.datefrom,' +
          'p1.dateto,' + 
          'p2.costprice,' +
          'p2.costgst,' +
          'p2.price1,' +
          'p2.price2,' +
          'p2.price3,' +
          'p2.price4,' +
          'p2.price5,' +
          'p2.price6,' +
          'p2.price7,' +
          'p2.price8,' +
          'p2.price9,' +
          'p2.price10,' +
          'p2.price11,' +
          'p2.price12,' +
          'p2.price13,' +
          'p2.price14,' +
          'p2.price15,' +
          'p2.uomsize,' +
          'p2.discountcode_id,' +
          'case when (p2.uomsize=0.0) then 0.0 else (p1.price / p2.uomsize) end unitprice,' +
          'case when (p2.uomsize=0.0) then 0.0 else (p1.gst / p2.uomsize) end unitgst,' +
          'case when (p2.uomsize=0.0) then 0.0 else (p1.price1 / p2.uomsize) end unitprice1,' +
          'case when (p2.uomsize=0.0) then 0.0 else (p1.gst1 / p2.uomsize) end unitgst1,' +
          'case when (p2.uomsize=0.0) then 0.0 else (p1.price2 / p2.uomsize) end unitprice2,' +
          'case when (p2.uomsize=0.0) then 0.0 else (p1.gst2 / p2.uomsize) end unitgst2,' +
          'case when (p2.uomsize=0.0) then 0.0 else (p1.price3 / p2.uomsize) end unitprice3,' +
          'case when (p2.uomsize=0.0) then 0.0 else (p1.gst3 / p2.uomsize) end unitgst3,' +
          'case when (p2.uomsize=0.0) then 0.0 else (p1.price4 / p2.uomsize) end unitprice4,' +
          'case when (p2.uomsize=0.0) then 0.0 else (p1.gst4 / p2.uomsize) end unitgst4,' +
          'case when (p2.uomsize=0.0) then 0.0 else (p1.price5 / p2.uomsize) end unitprice5,' +
          'case when (p2.uomsize=0.0) then 0.0 else (p1.gst5 / p2.uomsize) end unitgst5,' +
          'case when p1.minqty=0.0000 then null else p1.minqty end,' +
          'case when p1.maxqty=0.0000 then null else p1.maxqty end ' +
          'from ' +
          'products p2 left join pricing p1 on (p2.id=p1.products_id)' +
          'where ' +
          '(p2.customers_id=$1 ' +
          'and ' +
          'p2.id=$2 ' +
          'and ' +
          ' p1.dateto > (NOW() :: TIMESTAMP)' + 
          'and ' +
          'p1.dateexpired is null )' +
          'OR ' + 
          '(p1.customers_id=$1 ' + 
          'and ' +
          'p2.id=$2 ' + 
          'and ' +
          'p1.dateto is null ' + 
          'and ' +
          'p1.dateexpired is null )' + 
          'order by ' +
          'p1.clients_id desc,' +
          'p1.minqty,' +
          'p1.maxqty,' +
          'p1.price',
          [
            world.cn.custid,
            __.sanitiseAsBigInt(world.productid)
          ],
          function(err, result)
          {
            done();

            if (!err)
            {
              global.ConsoleLog(world.discountcode);
              global.ConsoleLog(world.pricelevel);
              var price = doSelectPrice(world, result.rows);
              global.ConsoleLog(price);
              global.ConsoleLog("the event name is " + world.eventname);
              // console.log(price);

              world.spark.emit(world.eventname, {rc: global.errcode_none, msg: global.text_success, fguid: world.fguid, price: price, pdata: world.pdata});
            }
            else
            {
              msg += global.text_generalexception + ' ' + err.message;
              global.ConsoleLog(msg);
              global.log.error({getprice: true}, msg);
              world.spark.emit(global.eventerror, {rc: global.errcode_fatal, msg: msg, pdata: world.pdata});
            }
          }
        );
      }
      else
      {
        global.log.error({getprice: true}, global.text_nodbconnection);
        world.spark.emit(global.eventerror, {rc: global.errcode_dbunavail, msg: global.text_nodbconnection, pdata: world.pdata});
      }
    }
  );
}


function SyncBuildTemplateFromProductTemplate(world) {
  var msg = '[' + world.eventname + '] ';

  global.pg.connect(
    global.cs,
    function (err, client, done) {
      if(!err)
      {
        var tx = new global.pgtx(client);
        tx.begin(
          (err) => {
            if (!err) {
              doSyncBuildTemplatesFromProductTemplates(tx, world).then(
                (result) => {
                  tx.commit(
                    (err) => {
                      if (!err) {

                        done();
                        world.spark.emit(world.eventname, {rc: global.errcode_none, msg: global.text_success, pdata: world.pdata});
                        global.pr.sendToRoomExcept(global.custchannelprefix + world.cn.custid, 'syncbuildtemplatefromproducttemplate',{}, world.spark.id);

                      } else {
                        tx.rollback( () => {
                          done();
                          msg += global.text_generalexception + ' ' + err.message;
                          global.log.error({syncbuildtemplatefromproducttemplate: true}, msg);
                          world.spark.emit(global.eventerror, {rc: global.errcode_fatal, msg: msg, pdata: world.pdata});
                        });
                        
                      }
                    }
                  );
                }
              ).catch(
                (err) => {
                  tx.rollback(
                    () => {
                      done();
                      msg += global.text_generalexception + ' ' + err.message;
                      global.log.error({syncbuildtemplatefromproducttemplate: true}, msg);
                      world.spark.emit(global.eventerror, {rc: global.errcode_fatal, msg: msg, pdata: world.pdata});
                    }
                  );
                }
              );
            } else {
              done();
              msg += global.text_generalexception + ' ' + err.message;
              global.log.error({syncbuildtemplatefromproducttemplate: true}, msg);
              world.spark.emit(global.eventerror, {rc: global.errcode_fatal, msg: msg, pdata: world.pdata});
            }
          }
        );
      }
      else
      {
        done();
        global.log.error({syncbuildtemplatefromproducttemplate: true}, global.text_nodbconnection);
        world.spark.emit(global.eventerror, {rc: global.errcode_dbunavail, msg: global.text_nodbconnection, pdata: world.pdata});
      }
    }
  );
}

function ListBuildTemplateRoots(world)
{
  var msg = '[' + world.eventname + '] ';
  //
  global.pg.connect
  (
    global.cs,
    function(err, client, done)
    {
      if (!err)
      {
        client.query
        (
          'select ' +
          'p1.id,' +
          'p1.code,' +
          'p1.name,' +
          'p1.price,' +
          'p1.gst,' +
          'p1.qty,' +
          'p1.taxcodes_id taxcodeid,' +
          'p1.producttemplateheaders_id producttemplateheaderid,' +
          't1.name taxcode,' +
          'c1.id clientid,' +
          'p1.datecreated,' +
          'p1.datemodified,' +
          'u1.name usercreated,' +
          'u2.name usermodified,' +
          'getnumproductsinbuildtemplate($1,p1.id) numproducts,' +
          'gettotalcostpricefrombuildtemplate($2,p1.id) totalprice,' +
          'p1.totalgst ' +
          'from ' +
          'buildtemplateheaders p1 left join taxcodes t1 on (p1.taxcodes_id=t1.id) ' +
          '                        left join clients c1 on (p1.clients_id=c1.id) ' +
          '                        left join users u1 on (p1.userscreated_id=u1.id) ' +
          '                        left join users u2 on (p1.usersmodified_id=u2.id) ' +
          'where ' +
          'p1.customers_id=$3 ' +
          'and ' +
          'p1.buildtemplateheaders_id is null ' +
          'and ' +
          'p1.dateexpired is null ' +
          'order by ' +
          'p1.path,' +
          'p1.code',
          [
            world.cn.custid,
            world.cn.custid,
            world.cn.custid
          ],
          function(err, result)
          {
            done();

            if (!err)
            {
              // JS returns date with TZ info/format, need in ISO format...
              result.rows.forEach
              (
                function(p)
                {
                  if (!__.isUndefined(p.datemodified) && !__.isNull(p.datemodified))
                    p.datemodified = global.moment(p.datemodified).format('YYYY-MM-DD HH:mm:ss');

                  p.datecreated = global.moment(p.datecreated).format('YYYY-MM-DD HH:mm:ss');
                }
              );

              world.spark.emit('listbuildtemplates_search', {rc: global.errcode_none, msg: global.text_success, fguid: world.fguid, rs: result.rows, pdata: world.pdata});
            }
            else
            {
              msg += global.text_generalexception + ' ' + err.message;
              global.log.error({listbuildtemplateroots: true}, msg);
              world.spark.emit(global.eventerror, {rc: global.errcode_fatal, msg: msg, pdata: world.pdata});
            }
          }
        );
      }
      else
      {
        global.log.error({syncbuildtemplatefromproducttemplate: true}, global.text_nodbconnection);
        world.spark.emit(global.eventerror, {rc: global.errcode_dbunavail, msg: global.text_nodbconnection, pdata: world.pdata});
      }
    }
  );
}

function SearchRootBuildTemplates_ByCodeAndName(world) {
  var msg = '[' + world.eventname + '] ';
  //
  global.pg.connect(
    global.cs,
    function (err, client, done) {
      if (!err) {
        client.query(
          'select DISTINCT ON (p1.id)' +
          // 'COUNT(p1.id), ' +
          'p1.id,' +
          'p1.code,' +
          'p1.name,' +
          'p1.price,' +
          'p1.gst,' +
          'p1.qty,' +
          'p1.taxcodes_id taxcodeid,' +
          'p1.producttemplateheaders_id producttemplateheaderid,' +
          't1.name taxcode,' +
          'p1.buildtemplateheaders_id parentid,' +
          'c1.id clientid,' +
          'p1.datecreated,' +
          'p1.datemodified,' +
          'u1.name usercreated,' +
          'u2.name usermodified,' +
          'getnumproductsinbuildtemplate($1,p1.id) numproducts,' +
          'gettotalcostpricefrombuildtemplate($1,p1.id) totalprice,' +
          'p1.totalgst ' +
          'from ' +
          'getbuildtemplatesrootbynodeandname($1, $2) p0 left join buildtemplateheaders p1 on (p1.id=p0.id) ' +
          '                        left join taxcodes t1 on (p1.taxcodes_id=t1.id) ' +
          '                        left join clients c1 on (p1.clients_id=c1.id) ' +
          '                        left join users u1 on (p1.userscreated_id=u1.id) ' +
          '                        left join users u2 on (p1.usersmodified_id=u2.id) ' +
          // 'where ' +
          // 'p1.customers_id=$1 ' +
          // 'and ' +
          // 'p1.dateexpired is null ' +
          'ORDER BY ' +
          'p1.id DESC,' +
          'p1.path,' +
          'p1.code ' +
          'LIMIT $3 OFFSET $4',
          [
            world.cn.custid,
            __.sanitiseAsString(world.inputValue, 50),
            world.pageSize,
            world.offset
          ],
          function (err, result) {
            if (!err) {
              result.rows.forEach(p => {
                if (!__.isUndefined(p.datemodified) && !__.isNull(p.datemodified))
                  p.datemodified = global.moment(p.datemodified).format('YYYY-MM-DD HH:mm:ss');

                p.datecreated = global.moment(p.datecreated).format('YYYY-MM-DD HH:mm:ss');
              });

              client.query(
                'SELECT COUNT(DISTINCT p1.id) FROM getbuildtemplatesrootbynodeandname($1, $2) p1',
                [
                  world.cn.custid,
                  __.sanitiseAsString(world.inputValue, 50),
                ],
                (err, result2) => {
                  if (!err) {
                    done();
                    world.spark.emit(world.eventname, {
                      rc: global.errcode_none,
                      msg: global.text_success,
                      fguid: world.fguid,
                      rs: result.rows,
                      totalCount: result2.rows[0].count,
                      pdata: world.pdata
                    });
                  } else {
                    done();
                    msg += global.text_generalexception + ' ' + err.message;
                    global.log.error({
                      searchrootbuildtemplates_bycodeandname: true
                    }, msg);
                    world.spark.emit(global.eventerror, {
                      rc: global.errcode_fatal,
                      msg: msg,
                      pdata: world.pdata
                    });
                  }
                }
              );
            } else {
              done();
              msg += global.text_generalexception + ' ' + err.message;
              global.log.error({
                searchrootbuildtemplates_bycodeandname: true
              }, msg);
              world.spark.emit(global.eventerror, {
                rc: global.errcode_fatal,
                msg: msg,
                pdata: world.pdata
              });
            }
          }
        );
      } else {
        done();
        global.log.error({
          searchrootbuildtemplates_bycodeandname: true
        }, global.text_nodbconnection);
        world.spark.emit(global.eventerror, {
          rc: global.errcode_dbunavail,
          msg: global.text_nodbconnection,
          pdata: world.pdata
        });
      }
    }
  );
}

function SearchBuildTemplates_ByCodeAndName(world) {
  var msg = '[' + world.eventname + '] ';

  global.pg.connect(
    global.cs,
    function (err, client, done) {
      if (!err) {
        client.query(
          'select DISTINCT ON (p1.id) ' +
          'p1.id,' +
          'p1.code,' +
          'p1.name,' +
          'p1.price,' +
          'p1.gst,' +
          'p1.qty,' +
          'p1.taxcodes_id taxcodeid,' +
          'p1.producttemplateheaders_id producttemplateheaderid,' +
          'p1.buildtemplateheaders_id parentid,' +
          't1.name taxcode,' +
          'c1.id clientid,' +
          'p1.datecreated,' +
          'p1.datemodified,' +
          'u1.name usercreated,' +
          'u2.name usermodified,' +
          'getnumproductsinbuildtemplate($1,p1.id) numproducts,' +
          'gettotalcostpricefrombuildtemplate($1,p1.id) totalprice,' +
          'p1.totalgst ' +
          'from ' +
          'getbuildtemplaterelatenodes($1, $2, $3, $4) p0 ' +
          '                        left join buildtemplateheaders p1 on (p0.id=p1.id) ' +
          '                        left join taxcodes t1 on (p1.taxcodes_id=t1.id) ' +
          '                        left join clients c1 on (p1.clients_id=c1.id) ' +
          '                        left join users u1 on (p1.userscreated_id=u1.id) ' +
          '                        left join users u2 on (p1.usersmodified_id=u2.id) ' +
          'order by ' +
          'p1.id,' +
          'p1.path,' +
          'p1.code',
          [
            world.cn.custid,
            __.sanitiseAsString(world.inputValue, 50),
            __.sanitiseAsBigInt(world.pageSize),
            __.sanitiseAsBigInt(world.offset)
          ],
          (err, result) => {
            if (!err) {
              result.rows.forEach(p => {

                if (!__.isUndefined(p.datemodified) && !__.isNull(p.datemodified))
                  p.datemodified = global.moment(p.datemodified).format('YYYY-MM-DD HH:mm:ss');

                p.datecreated = global.moment(p.datecreated).format('YYYY-MM-DD HH:mm:ss');

              });

              client.query('SELECT COUNT(DISTINCT p0.id) FROM getrootsearchbuildtemplates($1, $2) p0',
                [
                  world.cn.custid,
                  __.sanitiseAsString(world.inputValue, 50)
                ],
                (err, result2) => {
                  done();
                  if (!err) {
                    world.spark.emit(world.eventname, {
                      rc: global.errcode_none,
                      msg: global.text_success,
                      fguid: world.fguid,
                      rs: result.rows,
                      totalCount: result2.rows[0].count,
                      inputValue:world.inputValue,
                      pdata: world.pdata
                    });
                  } else {
                    done();
                    global.log.error({
                      searchbuildtemplates_bycodeandname: true
                    }, global.text_nodbconnection);
                    world.spark.emit(global.eventerror, {
                      rc: global.errcode_dbunavail,
                      msg: global.text_nodbconnection,
                      pdata: world.pdata
                    });
                  }
                });
            } else {
              done();
              global.log.error({
                searchbuildtemplates_bycodeandname: true
              }, global.text_nodbconnection);
              world.spark.emit(global.eventerror, {
                rc: global.errcode_dbunavail,
                msg: global.text_nodbconnection,
                pdata: world.pdata
              });
            }
          });
      } else {
        dong();
        global.log.error({
          searchbuildtemplates_bycodeandname: true
        }, global.text_nodbconnection);
        world.spark.emit(global.eventerror, {
          rc: global.errcode_dbunavail,
          msg: global.text_nodbconnection,
          pdata: world.pdata
        });
      }
    });
}

function ListBuildTemplates_ByParentID(world) {
  var msg = '[' + world.eventname + '] ';
  //
  global.pg.connect(
    global.cs,
    function (err, client, done) {
      if (!err) {
        client.query(
          'select ' +
          'p1.id,' +
          'p1.code,' +
          'p1.name,' +
          'p1.price,' +
          'p1.gst,' +
          'p1.qty,' +
          'p1.taxcodes_id taxcodeid,' +
          'p1.producttemplateheaders_id producttemplateheaderid,' +
          't1.name taxcode,' +
          'p2.id parentid,' +
          'c1.id clientid,' +
          'p1.datecreated,' +
          'p1.datemodified,' +
          'u1.name usercreated,' +
          'u2.name usermodified,' +
          'getnumproductsinbuildtemplate($1,p1.id) numproducts,' +
          'gettotalcostpricefrombuildtemplate($1,p1.id) totalprice,' +
          'p1.totalgst ' +
          'from ' +
          'buildtemplateheaders p1 left join buildtemplateheaders p2 on (p1.buildtemplateheaders_id=p2.id) ' +
          '                        left join taxcodes t1 on (p1.taxcodes_id=t1.id) ' +
          '                        left join clients c1 on (p1.clients_id=c1.id) ' +
          '                        left join users u1 on (p1.userscreated_id=u1.id) ' +
          '                        left join users u2 on (p1.usersmodified_id=u2.id) ' +
          'where ' +
          'p1.customers_id=$1 ' +
          'and ' +
          'p1.dateexpired is null ' +
          'and p1.id = $2' +
          'and p1.buildtemplateheaders_id is null ' +
          'order by ' +
          'p1.path,' +
          'p2.id desc,' +
          'p1.code', 
          [
            world.cn.custid,
            __.sanitiseAsBigInt(world.buildtemplateid)
          ],
          function (err, result) {
            if (!err) {
              result.rows.forEach(p => {
                if (!__.isUndefined(p.datemodified) && !__.isNull(p.datemodified))
                  p.datemodified = global.moment(p.datemodified).format('YYYY-MM-DD HH:mm:ss');

                p.datecreated = global.moment(p.datecreated).format('YYYY-MM-DD HH:mm:ss');
              });

              world.spark.emit('listbuildtemplates_search', {
                rc: global.errcode_none,
                msg: global.text_success,
                fguid: world.fguid,
                // rs: resultRows,
                rs: result.rows,
                pdata: world.pdata
              });
            } else {
              msg += global.text_generalexception + ' ' + err.message;
              global.log.error({
                listbuildtemplates_byparentid: true
              }, msg);
              world.spark.emit(global.eventerror, {
                rc: global.errcode_fatal,
                msg: msg,
                pdata: world.pdata
              });
            }
            done();
          }
        );
      } else {
        global.log.error({
          listbuildtemplates_byparentid: true
        }, global.text_nodbconnection);
        world.spark.emit(global.eventerror, {
          rc: global.errcode_dbunavail,
          msg: global.text_nodbconnection,
          pdata: world.pdata
        });
      }
    }
  );
}

function ListBuildTemplates_Pagination(world) {
  var msg = '[' + world.eventname + '] ';
  //
  global.pg.connect(
    global.cs,
    function (err, client, done) {
      if (!err) {
        client.query(
          'SELECT ' +
          'p1.id,' +
          'p1.code,' +
          'p1.name,' +
          'p1.price,' +
          'p1.gst,' +
          'p1.qty,' +
          'p1.taxcodes_id taxcodeid,' +
          'p1.producttemplateheaders_id producttemplateheaderid,' +
          't1.name taxcode,' +
          'p2.id parentid,' +
          'c1.id clientid,' +
          'p1.datecreated,' +
          'p1.datemodified,' +
          'u1.name usercreated,' +
          'u2.name usermodified,' +
          'getnumproductsinbuildtemplate($1,p1.id) numproducts,' +
          'gettotalcostpricefrombuildtemplate($1,p1.id) totalprice,' +
          'p1.totalgst ' +
          'FROM ' +
          'buildtemplateheaders p1 left join buildtemplateheaders p2 on (p1.buildtemplateheaders_id=p2.id) ' +
          '                        left join taxcodes t1 on (p1.taxcodes_id=t1.id) ' +
          '                        left join clients c1 on (p1.clients_id=c1.id) ' +
          '                        left join users u1 on (p1.userscreated_id=u1.id) ' +
          '                        left join users u2 on (p1.usersmodified_id=u2.id) ' +
          'WHERE ' +
          'p1.customers_id=$1 ' +
          'AND ' +
          'p1.dateexpired IS NULL ' +
          'AND p1.buildtemplateheaders_id IS NULL ' +
          'ORDER BY ' +
          'p1.path,' +
          'p2.id desc,' +
          'p1.code ' +
          'LIMIT $2 OFFSET $3',
          [
            world.cn.custid,
            __.sanitiseAsBigInt(world.pageSize),
            __.sanitiseAsBigInt(world.offset)
          ],
          function (err, result) {
            if (!err) {

              result.rows.forEach(p => {
                if (!__.isUndefined(p.datemodified) && !__.isNull(p.datemodified))
                  p.datemodified = global.moment(p.datemodified).format('YYYY-MM-DD HH:mm:ss');

                p.datecreated = global.moment(p.datecreated).format('YYYY-MM-DD HH:mm:ss');
              });

              client.query('SELECT COUNT(p1.id) FROM buildtemplateheaders p1 WHERE p1.customers_id=$1 AND p1.buildtemplateheaders_id IS NULL AND p1.dateexpired IS NULL ',
              [
                world.cn.custid
              ], 
              function (err, result2) {
                done();
                if(!err){
                  world.spark.emit(world.eventname, 
                    {
                      rc: global.errcode_none,
                      msg: global.text_success,
                      fguid: world.fguid,
                      rs: result.rows,
                      totalCount: parseInt(result2.rows[0].count),
                      pageNumber: world.pageNumber,
                      pdata: world.pdata
                    });
                } else {
                  msg += global.text_generalexception + ' ' + err.message;
                  global.log.error({
                    listbuildtemplates_pagination: true
                  }, msg);

                  world.spark.emit(global.eventerror, {
                    rc: global.errcode_fatal,
                    msg: msg,
                    pdata: world.pdata
                  });
                }
              });
            }
            else
            {
              msg += global.text_generalexception + ' ' + err.message;
              global.log.error({
                listbuildtemplates_pagination: true
              }, msg);

              world.spark.emit(global.eventerror, {
                rc: global.errcode_fatal,
                msg: msg,
                pdata: world.pdata
              });
            }
          }
        );
      } else {
        global.log.error({
          listbuildtemplates_pagination: true
        }, global.text_nodbconnection);

        world.spark.emit(global.eventerror, {
          rc: global.errcode_dbunavail,
          msg: global.text_nodbconnection,
          pdata: world.pdata
        });
      }
    }
  );
}


// function ListBuildTemplateRoots(world)
function SearchBuildTemplates(world)
{
  // var msg = '[' + world.eventname + '] ';
  // //
  // global.pg.connect
  // (
  //   global.cs,
  //   function(err, client, done)
  //   {
  //     if (!err)
  //     {
  //       client.query
  //       (
  //         'select ' +
  //         'p1.id,' +
  //         'p1.code,' +
  //         'p1.name,' +
  //         'p1.price,' +
  //         'p1.gst,' +
  //         'p1.qty,' +
  //         'p1.taxcodes_id taxcodeid,' +
  //         'p1.producttemplateheaders_id producttemplateheaderid,' +
  //         't1.name taxcode,' +
  //         'c1.id clientid,' +
  //         'p1.datecreated,' +
  //         'p1.datemodified,' +
  //         'u1.name usercreated,' +
  //         'u2.name usermodified,' +
  //         'getnumproductsinbuildtemplate($1,p1.id) numproducts,' +
  //         'gettotalcostpricefrombuildtemplate($2,p1.id) totalprice,' +
  //         'p1.totalgst ' +
  //         'from ' +
  //         'buildtemplateheaders p1 left join taxcodes t1 on (p1.taxcodes_id=t1.id) ' +
  //         '                        left join clients c1 on (p1.clients_id=c1.id) ' +
  //         '                        left join users u1 on (p1.userscreated_id=u1.id) ' +
  //         '                        left join users u2 on (p1.usersmodified_id=u2.id) ' +
  //         'where ' +
  //         'p1.customers_id=$3 ' +
  //         'and ' +
  //         'p1.buildtemplateheaders_id is null ' +
  //         'and ' +
  //         'p1.dateexpired is null ' +
  //         'and upper(p1.code) ~ upper($4) ' +
  //         'and p1.path = $5 ' +
  //         'order by ' +
  //         'p1.path,' +
  //         'p2.id desc,' +
  //         'p1.code',
  //         [
  //           world.cn.custid,
  //           world.cn.custid,
  //           world.cn.custid,
  //           world.inputValue,
  //           '/'
  //         ],
  //         function(err, result)
  //         {
  //           done();

  //           if (!err)
  //           {
  //             // JS returns date with TZ info/format, need in ISO format...
  //             result.rows.forEach
  //             (
  //               function(p)
  //               {
  //                 // if (!__.isUndefined(p.datemodified) && !__.isNull(p.datemodified))
  //                 //   p.datemodified = global.moment(p.datemodified).format('YYYY-MM-DD HH:mm:ss');

  //                 // p.datecreated = global.moment(p.datecreated).format('YYYY-MM-DD HH:mm:ss');
  //                 // let nodes = doFindChildren(world, client, p.id);
  //                 // console.log("NOOOOOOdes::::: " + nodes.length);
  //                 try {
  //                   let nodes = doFindChildren(world, client, p.id);
  //                   console.log("NOOOOOOdes::::: " + nodes.length);
  //                   // .then(res => {
  //                    let id = setInterval(() => {
  //                     if(nodes.length !==0 ){
  //                       resultRows = resultRows.concat(nodes);
  //                       clearInterval(id);
  //                     }
  //                   }, 500);
  //                    world.spark.emit(world.eventname, {
  //                     rc: global.errcode_none,
  //                     msg: global.text_success,
  //                     fguid: world.fguid,
  //                     rs: resultRows,
  //                     pdata: world.pdata
  //                   });
  //                  } catch (err) {
  //                   msg += global.text_generalexception + ' ' + err.message;
  //                     global.log.error({
  //                       listbuildtemplates_search: true
  //                     }, msg);
  //                     world.spark.emit(global.eventerror, {
  //                       rc: global.errcode_fatal,
  //                       msg: msg,
  //                       pdata: world.pdata
  //                     });
  //                 }
  //               }
  //             );

  //             world.spark.emit(world.eventname, {rc: global.errcode_none, msg: global.text_success, fguid: world.fguid, rs: result.rows, pdata: world.pdata});
  //           }
  //           else
  //           {
  //             msg += global.text_generalexception + ' ' + err.message;
  //             global.log.error({listbuildtemplateroots: true}, msg);
  //             world.spark.emit(global.eventerror, {rc: global.errcode_fatal, msg: msg, pdata: world.pdata});
  //           }
  //         }
  //       );
  //     }
  //     else
  //     {
  //       global.log.error({listbuildtemplateroots: true}, global.text_nodbconnection);
  //       world.spark.emit(global.eventerror, {rc: global.errcode_dbunavail, msg: global.text_nodbconnection, pdata: world.pdata});
  //     }
  //   }
  // );
}

function BuildTemplateGetChildren(world)
{
  var msg = '[' + world.eventname + '] ';
  //
  global.pg.connect
  (
    global.cs,
    function(err, client, done)
    {
      if (!err)
      {
        client.query
        (
          'select ' +
          'p1.id,' +
          'p1.code,' +
          'p1.name,' +
          'p1.price,' +
          'p1.gst,' +
          'p1.qty,' +
          'p1.taxcodes_id taxcodeid,' +
          'p1.producttemplateheaders_id producttemplateheaderid,' +
          't1.name taxcode,' +
          'p0.buildtemplateheaders_id parentid,' +
          'c1.id clientid,' +
          'p1.datecreated,' +
          'p1.datemodified,' +
          'u1.name usercreated,' +
          'u2.name usermodified,' +
          'getnumproductsinbuildtemplate($1,p1.id) numproducts,' +
          'gettotalcostpricefrombuildtemplate($2,p1.id) totalprice,' +
          'p1.totalgst ' +
          'from ' +
          'getchildrenofbuildtemplateheader($3,$4) p0 left join buildtemplateheaders p1 on (p0.id=p1.id) ' +
          '                                           left join taxcodes t1 on (p1.taxcodes_id=t1.id) ' +
          '                                           left join clients c1 on (p1.clients_id=c1.id) ' +
          '                                           left join users u1 on (p1.userscreated_id=u1.id) ' +
          '                                           left join users u2 on (p1.usersmodified_id=u2.id) ' +
          'order by ' +
          'p1.path,' +
          'p0.buildtemplateheaders_id desc,' +
          'p1.code',
          [
            world.cn.custid,
            world.cn.custid,
            world.cn.custid,
            __.sanitiseAsBigInt(world.buildtemplateid)
          ],
          function(err, result)
          {
            done();

            if (!err)
            {
              // JS returns date with TZ info/format, need in ISO format...
              result.rows.forEach
              (
                function(p)
                {
                  if (!__.isUndefined(p.datemodified) && !__.isNull(p.datemodified))
                    p.datemodified = global.moment(p.datemodified).format('YYYY-MM-DD HH:mm:ss');

                  p.datecreated = global.moment(p.datecreated).format('YYYY-MM-DD HH:mm:ss');
                }
              );

              world.pdata.buildtemplateid = world.buildtemplateid;
              world.spark.emit(world.eventname, {rc: global.errcode_none, msg: global.text_success, fguid: world.fguid, rs: result.rows, pdata: world.pdata});
            }
            else
            {
              msg += global.text_generalexception + ' ' + err.message;
              global.log.error({buildtemplategetchildren: true}, msg);
              world.spark.emit(global.eventerror, {rc: global.errcode_fatal, msg: msg, pdata: world.pdata});
            }
          }
        );
      }
      else
      {
        global.log.error({buildtemplategetchildren: true}, global.text_nodbconnection);
        world.spark.emit(global.eventerror, {rc: global.errcode_dbunavail, msg: global.text_nodbconnection, pdata: world.pdata});
      }
    }
  );
}

function NewBuildTemplate(world)
{
  var msg = '[' + world.eventname + '] ';
  //
  global.pg.connect
  (
    global.cs,
    function(err, client, done)
    {
      if (!err)
      {
        var tx = new global.pgtx(client);
        tx.begin
        (
          function(err)
          {
            if (!err)
            {
              var datecreated = null;
              var usercreated = null;

              doNewBuildTemplateStep1(tx, world.cn.custid, world.cn.userid, world.code, world.clientid).then
              (
                function(result)
                {
                  world.buildtemplateid = result.buildtemplateid;
                  datecreated = global.moment(result.datecreated).format('YYYY-MM-DD HH:mm:ss');
                  usercreated = result.usercreated;
                  return doNewBuildTemplateStep2(tx, world.cn.custid, world.cn.userid, world.code, world.clientid, world.buildtemplateid, world.templates);
                }
              ).then
              (
                function(result)
                {
                  tx.commit
                  (
                    function(err)
                    {
                      if (!err)
                      {
                        done();
                        world.spark.emit
                        (
                          world.eventname,
                          {
                            rc: global.errcode_none,
                            msg: global.text_success,
                            buildtemplateid: world.buildtemplateid,
                            datecreated: datecreated,
                            usercreated: usercreated,
                            pdata: world.pdata
                          }
                        );
                        global.pr.sendToRoomExcept
                        (
                          global.custchannelprefix + world.cn.custid,
                          'buildtemplatecreated',
                          {
                            buildtemplateid: world.buildtemplateid,
                            datecreated: datecreated,
                            usercreated: usercreated
                          },
                          world.spark.id
                        );
                      }
                      else
                      {
                        tx.rollback
                        (
                          function(ignore)
                          {
                            done();
                            msg += global.text_tx + ' ' + err.message;
                            global.log.error({newbuildtemplate: true}, msg);
                            world.spark.emit(global.eventerror, {rc: global.errcode_dberr, msg: msg, pdata: world.pdata});
                          }
                        );
                      }
                    }
                  );
                }
              ).then
              (
                null,
                function(err)
                {
                  tx.rollback
                  (
                    function(ignore)
                    {
                      done();

                      msg += global.text_generalexception + ' ' + err.message;
                      global.log.error({newbuildtemplate: true}, msg);
                      world.spark.emit(global.eventerror, {rc: global.errcode_fatal, msg: msg, pdata: world.pdata});
                    }
                  );
                }
              );
            }
            else
            {
              done();
              msg += global.text_notxstart + ' ' + err.message;
              global.log.error({newbuildtemplate: true}, msg);
              world.spark.emit(global.eventerror, {rc: global.errcode_dberr, msg: msg, pdata: world.pdata});
            }
          }
        );
      }
      else
      {
        global.log.error({newbuildtemplate: true}, global.text_nodbconnection);
        world.spark.emit(global.eventerror, {rc: global.errcode_dbunavail, msg: global.text_nodbconnection, pdata: world.pdata});
      }
    }
  );
}

function SaveBuildTemplate(world)
{
  var msg = '[' + world.eventname + '] ';
  //
  global.pg.connect
  (
    global.cs,
    function(err, client, done)
    {
      if (!err)
      {
        var tx = new global.pgtx(client);
        tx.begin
        (
          function(err)
          {
            if (!err)
            {
              doSaveBuildTemplate(tx, world).then
              (
                function(result)
                {
                  tx.commit
                  (
                    function(err)
                    {
                      if (!err)
                      {
                        done();
                        world.spark.emit(world.eventname, {rc: global.errcode_none, msg: global.text_success, buildtemplateid: world.buildtemplateid, datemodified: result.datemodified, usermodified: result.usermodified, pdata: world.pdata});
                        global.pr.sendToRoomExcept(global.custchannelprefix + world.cn.custid, 'buildtemplatesaved', {buildtemplateid: world.buildtemplateid, datemodified: result.datemodified, usermodified: result.usermodified}, world.spark.id);
                      }
                      else
                      {
                        tx.rollback
                        (
                          function(ignore)
                          {
                            done();
                            msg += global.text_tx + ' ' + err.message;
                            global.log.error({savebuildtemplate: true}, msg);
                            world.spark.emit(global.eventerror, {rc: global.errcode_dberr, msg: msg, pdata: world.pdata});
                          }
                        );
                      }
                    }
                  );
                }
              ).then
              (
                null,
                function(err)
                {
                  tx.rollback
                  (
                    function(ignore)
                    {
                      done();

                      msg += global.text_generalexception + ' ' + err.message;
                      global.log.error({savebuildtemplate: true}, msg);
                      world.spark.emit(global.eventerror, {rc: global.errcode_fatal, msg: msg, pdata: world.pdata});
                    }
                  );
                }
              );
            }
            else
            {
              done();
              msg += global.text_notxstart + ' ' + err.message;
              global.log.error({savebuildtemplate: true}, msg);
              world.spark.emit(global.eventerror, {rc: global.errcode_dberr, msg: msg, pdata: world.pdata});
            }
          }
        );
      }
      else
      {
        global.log.error({savebuildtemplate: true}, global.text_nodbconnection);
        world.spark.emit(global.eventerror, {rc: global.errcode_dbunavail, msg: global.text_nodbconnection, pdata: world.pdata});
      }
    }
  );
}

function CheckBuildTemplateCode(world)
{
  var msg = '[' + world.eventname + '] ';
  //
  global.pg.connect
  (
    global.cs,
    function(err, client, done)
    {
      if (!err)
      {
        client.query
        (
          'select ' +
          'bth1.id,' +
          'bth1.code,' +
          'bth1.name ' +
          'from ' +
          'buildtemplateheaders bth1 ' +
          'where ' +
          'bth1.customers_id=$1 ' +
          'and ' +
          'bth1.dateexpired is null ' +
          'and ' +
          'upper(bth1.code)=upper($2)',
          [
            world.cn.custid,
            world.code
          ],
          function(err, result)
          {
            done();

            if (!err)
              world.spark.emit(world.eventname, {rc: global.errcode_none, msg: global.text_success, fguid: world.fguid, rs: result.rows, pdata: world.pdata});
            else
            {
              msg += global.text_generalexception + ' ' + err.message;
              global.log.error({checkbuildtemplatecode: true}, msg);
              world.spark.emit(global.eventerror, {rc: global.errcode_fatal, msg: msg, pdata: world.pdata});
            }
          }
        );
      }
      else
      {
        global.log.error({checkbuildtemplatecode: true}, global.text_nodbconnection);
        world.spark.emit(global.eventerror, {rc: global.errcode_dbunavail, msg: global.text_nodbconnection, pdata: world.pdata});
      }
    }
  );
}

function NewProductCode(world)
{
  var msg = '[' + world.eventname + '] ';
  //
  global.pg.connect
  (
    global.cs,
    function(err, client, done)
    {
      if (!err)
      {
        var tx = new global.pgtx(client);
        tx.begin
        (
          function(err)
          {
            if (!err)
            {
              doNewProductCode(tx, world).then
              (
                function(result)
                {
                  tx.commit
                  (
                    function(err)
                    {
                      if (!err)
                      {
                        done();
                        world.spark.emit
                        (
                          world.eventname,
                          {
                            rc: global.errcode_none,
                            msg: global.text_success,
                            productid: result.productid,
                            productcodeid: result.productcodeid,
                            datecreated: result.datecreated,
                            usercreated: result.usercreated,
                            pdata: world.pdata
                          }
                        );
                        global.pr.sendToRoomExcept
                        (
                          global.custchannelprefix + world.cn.custid,
                          'productcodecreated',
                          {
                            productid: result.productid,
                            productcodeid: result.productcodeid,
                            datecreated: result.datecreated,
                            usercreated: result.usercreated
                          },
                          world.spark.id
                        );
                      }
                      else
                      {
                        tx.rollback
                        (
                          function(ignore)
                          {
                            done();
                            msg += global.text_tx + ' ' + err.message;
                            global.log.error({newproductcode: true}, msg);
                            world.spark.emit(global.eventerror, {rc: global.errcode_dberr, msg: msg, pdata: world.pdata});
                          }
                        );
                      }
                    }
                  );
                }
              ).then
              (
                null,
                function(err)
                {
                  tx.rollback
                  (
                    function(ignore)
                    {
                      done();

                      msg += global.text_generalexception + ' ' + err.message;
                      global.log.error({newproductcode: true}, msg);
                      world.spark.emit(global.eventerror, {rc: global.errcode_fatal, msg: msg, pdata: world.pdata});
                    }
                  );
                }
              );
            }
            else
            {
              done();
              msg += global.text_notxstart + ' ' + err.message;
              global.log.error({newproductcode: true}, msg);
              world.spark.emit(global.eventerror, {rc: global.errcode_dberr, msg: msg, pdata: world.pdata});
            }
          }
        );
      }
      else
      {
        global.log.error({newproductcode: true}, global.text_nodbconnection);
        world.spark.emit(global.eventerror, {rc: global.errcode_dbunavail, msg: global.text_nodbconnection, pdata: world.pdata});
      }
    }
  );
}

function ListProductCodes(world)
{
  var msg = '[' + world.eventname + '] ';
  //
  global.pg.connect
  (
    global.cs,
    function(err, client, done)
    {
      if (!err)
      {
        client.query
        (
          'select ' +
          'pc1.id,' +
          'pc1.suppliers_id supplierid,' +
          'pc1.code,' +
          'pc1.barcode,' +
          'pc1.datecreated,' +
          'pc1.datemodified,' +
          'u1.name usercreated,' +
          'u2.name usermodified ' +
          'from ' +
          'productcodes pc1 left join users u1 on (pc1.userscreated_id=u1.id) ' +
          '                 left join users u2 on (pc1.usersmodified_id=u2.id) ' +
          'where ' +
          'pc1.customers_id=$1 ' +
          'and ' +
          'pc1.dateexpired is null ' +
          'and ' +
          'pc1.products_id=$2 ' +
          'order by ' +
          'pc1.code',
          [
            world.cn.custid,
            __.sanitiseAsBigInt(world.productid)
          ],
          function(err, result)
          {
            done();

            if (!err)
            {
              // JS returns date with TZ info/format, need in ISO format...
              result.rows.forEach
              (
                function(p)
                {
                  if (!__.isUndefined(p.datemodified) && !__.isNull(p.datemodified))
                    p.datemodified = global.moment(p.datemodified).format('YYYY-MM-DD HH:mm:ss');

                  p.datecreated = global.moment(p.datecreated).format('YYYY-MM-DD HH:mm:ss');
                }
              );

              world.spark.emit(world.eventname, {rc: global.errcode_none, msg: global.text_success, fguid: world.fguid, rs: result.rows, pdata: world.pdata});
            }
            else
            {
              msg += global.text_generalexception + ' ' + err.message;
              global.log.error({listproductcodes: true}, msg);
              world.spark.emit(global.eventerror, {rc: global.errcode_fatal, msg: msg, pdata: world.pdata});
            }
          }
        );
      }
      else
      {
        global.log.error({listproductcodes: true}, global.text_nodbconnection);
        world.spark.emit(global.eventerror, {rc: global.errcode_dbunavail, msg: global.text_nodbconnection, pdata: world.pdata});
      }
    }
  );
}

function ExpireProductCode(world)
{
  var msg = '[' + world.eventname + '] ';
  //
  global.pg.connect
  (
    global.cs,
    function(err, client, done)
    {
      if (!err)
      {
        var tx = new global.pgtx(client);
        tx.begin
        (
          function(err)
          {
            if (!err)
            {
              doExpireProductCode(tx, world).then
              (
                function(result)
                {
                  tx.commit
                  (
                    function(err)
                    {
                      if (!err)
                      {
                        done();
                        world.spark.emit(world.eventname, {rc: global.errcode_none, msg: global.text_success, productid: result.productid, productcodeid: world.productcodeid, dateexpired: result.dateexpired, userexpired: result.userexpired, pdata: world.pdata});
                        global.pr.sendToRoomExcept(global.custchannelprefix + world.cn.custid, 'productcodeexpired', {productid: result.productid, productcodeid: world.productcodeid, dateexpired: result.dateexpired, userexpired: result.userexpired}, world.spark.id);
                      }
                      else
                      {
                        tx.rollback
                        (
                          function(ignore)
                          {
                            done();
                            msg += global.text_tx + ' ' + err.message;
                            global.log.error({expireproductcode: true}, msg);
                            world.spark.emit(global.eventerror, {rc: global.errcode_dberr, msg: msg, pdata: world.pdata});
                          }
                        );
                      }
                    }
                  );
                }
              ).then
              (
                null,
                function(err)
                {
                  tx.rollback
                  (
                    function(ignore)
                    {
                      done();

                      msg += global.text_generalexception + ' ' + err.message;
                      global.log.error({expireproductcode: true}, msg);
                      world.spark.emit(global.eventerror, {rc: global.errcode_fatal, msg: msg, pdata: world.pdata});
                    }
                  );
                }
              );
            }
            else
            {
              done();
              msg += global.text_notxstart + ' ' + err.message;
              global.log.error({expireproductcode: true}, msg);
              world.spark.emit(global.eventerror, {rc: global.errcode_dberr, msg: msg, pdata: world.pdata});
            }
          }
        );
      }
      else
      {
        global.log.error({expireproductcode: true}, global.text_nodbconnection);
        world.spark.emit(global.eventerror, {rc: global.errcode_dbunavail, msg: global.text_nodbconnection, pdata: world.pdata});
      }
    }
  );
}

function ListDiscountCode(world)
{
  var msg = '[' + world.eventname + '] ';
 
  global.pg.connect
  (
    global.cs,
    function(err, client, done)
    {
      if (!err)
      {
        client.query
        (
          'SELECT ' + 
          'd.id, ' + 
          'd.full_name, '+
          'd.short_name, '+
          'd.level_1, d.level_2, d.level_3, d.level_4, d.level_5, d.level_6, d.level_7, '+
          'd.level_8, d.level_9, d.level_10, d.level_11, d.level_12, d.level_13, d.level_14, d.level_15, '+
          'd.usersmodified_id, d.datecreated, d.datemodified, ' + 
          'u1.name usercreated, '+
          'u2.name usermodified ' +
          'from discountcode d left join users u1 on (d.userscreated_id=u1.id) '+
                              'left join users u2 on (d.usersmodified_id=u2.id) '+
          'where d.dateexpired is null ' + 
          'order by '+
          'd.id',
          function(err, result)
          {
            done();

            if (!err)
            {
              // JS returns date with TZ info/format, need in ISO format...
              result.rows.forEach
              (
                function(p)
                {
                  //global.ConsoleLog(p);
                  if (!__.isUndefined(p.datemodified) && !__.isNull(p.datemodified))
                    p.datemodified = global.moment(p.datemodified).format('YYYY-MM-DD HH:mm:ss');

                  p.datecreated = global.moment(p.datecreated).format('YYYY-MM-DD HH:mm:ss');
                }
              );

              world.spark.emit(world.eventname, {rc: global.errcode_none, msg: global.text_success, fguid: world.fguid, rs: result.rows, pdata: world.pdata});
            }
            else
            {
              msg += global.text_generalexception + ' ' + err.message;
              global.log.error({listdiscountcode: true}, msg);
              world.spark.emit(global.eventerror, {rc: global.errcode_fatal, msg: msg, pdata: world.pdata});
            }
          }
        );
      }
      else
      {
        global.log.error({listdiscountcode: true}, global.text_nodbconnection);
        world.spark.emit(global.eventerror, {rc: global.errcode_dbunavail, msg: global.text_nodbconnection, pdata: world.pdata});
      }
    }
  );
}

function NewDiscountCode(world)
{
  var msg = '[' + world.eventname + '] ';
  //
  global.pg.connect
  (
    global.cs,
    function(err, client, done)
    {
      if (!err)
      {
        var tx = new global.pgtx(client);
        tx.begin
        (
          function(err)
          {
            if (!err)
            {
              doNewDiscountCode(tx, world).then
              (
                function(result)
                {
                  tx.commit
                  (
                    function(err)
                    {
                      if (!err)
                      {
                        done();
                        world.spark.emit
                        (
                          world.eventname,
                          {
                            rc: global.errcode_none,
                            msg: global.text_success,
                            discountcodeid: result.discountcodeid,
                            // productid: world.productid,
                            datecreated: result.datecreated,
                            usercreated: result.usercreated,
                            pdata: world.pdata
                          }
                        );
                        global.pr.sendToRoomExcept
                        (
                          global.custchannelprefix + world.cn.custid,
                          'newdiscountcode',
                          {
                            discountcodeid: result.discountcodeid,
                            // productid: world.productid,
                            datecreated: result.datecreated,
                            usercreated: result.usercreated
                          },
                          world.spark.id
                        );
                      }
                      else
                      {
                        tx.rollback
                        (
                          function(ignore)
                          {
                            done();
                            msg += global.text_tx + ' ' + err.message;
                            global.log.error({newdiscountcode: true}, msg);
                            world.spark.emit(global.eventerror, {rc: global.errcode_dberr, msg: msg, pdata: world.pdata});
                          }
                        );
                      }
                    }
                  );
                }
              ).then
              (
                null,
                function(err)
                {
                  tx.rollback
                  (
                    function(ignore)
                    {
                      done();

                      msg += global.text_generalexception + ' ' + err.message;
                      global.log.error({newdiscountcode: true}, msg);
                      world.spark.emit(global.eventerror, {rc: global.errcode_fatal, msg: msg, pdata: world.pdata});
                    }
                  );
                }
              );
            }
            else
            {
              done();
              msg += global.text_notxstart + ' ' + err.message;
              global.log.error({newdiscountcode: true}, msg);
              world.spark.emit(global.eventerror, {rc: global.errcode_dberr, msg: msg, pdata: world.pdata});
            }
          }
        );
      }
      else
      {
        global.log.error({newdiscountcode: true}, global.text_nodbconnection);
        world.spark.emit(global.eventerror, {rc: global.errcode_dbunavail, msg: global.text_nodbconnection, pdata: world.pdata});
      }
    }
  );
}

function SaveDiscountCode(world)
{
  var msg = '[' + world.eventname + '] ';
  //
  global.pg.connect
  (
    global.cs,
    function(err, client, done)
    {
      if (!err)
      {
        var tx = new global.pgtx(client);
        tx.begin
        (
          function(err)
          {
            if (!err)
            {
              doSaveDiscountCode(tx, world).then
              (
                function(result)
                {
                  tx.commit
                  (
                    function(err)
                    {
                      if (!err)
                      {
                        done();
                        world.spark.emit(world.eventname, {rc: global.errcode_none, msg: global.text_success, discountcodeid: result.discountcodeid, datemodified: result.datemodified, usermodified: result.usermodified, pdata: world.pdata});
                        global.pr.sendToRoomExcept(global.custchannelprefix + world.cn.custid, 'discountcodesaved', {priceid: world.priceid, productid: result.productid, datecreated: result.datecreated, usercreated: result.usercreated}, world.spark.id);
                      }
                      else
                      {
                        tx.rollback
                        (
                          function(ignore)
                          {
                            done();
                            msg += global.text_tx + ' ' + err.message;
                            global.log.error({savediscountcode: true}, msg);
                            world.spark.emit(global.eventerror, {rc: global.errcode_dberr, msg: msg, pdata: world.pdata});
                          }
                        );
                      }
                    }
                  );
                }
              ).then
              (
                null,
                function(err)
                {
                  tx.rollback
                  (
                    function(ignore)
                    {
                      done();

                      msg += global.text_generalexception + ' ' + err.message;
                      global.log.error({savediscountcode: true}, msg);
                      world.spark.emit(global.eventerror, {rc: global.errcode_fatal, msg: msg, pdata: world.pdata});
                    }
                  );
                }
              );
            }
            else
            {
              done();
              msg += global.text_notxstart + ' ' + err.message;
              global.log.error({savediscountcode: true}, msg);
              world.spark.emit(global.eventerror, {rc: global.errcode_dberr, msg: msg, pdata: world.pdata});
            }
          }
        );
      }
      else
      {
        global.log.error({savediscountcode: true}, global.text_nodbconnection);
        world.spark.emit(global.eventerror, {rc: global.errcode_dbunavail, msg: global.text_nodbconnection, pdata: world.pdata});
      }
    }
  );
}

function ExpireDiscountCode(world)
{
  var msg = '[' + world.eventname + '] ';
  //
  global.pg.connect
  (
    global.cs,
    function(err, client, done)
    {
      if (!err)
      {
        var tx = new global.pgtx(client);
        tx.begin
        (
          function(err)
          {
            if (!err)
            {
              doExpireDiscountCode(tx, world).then
              (
                function(result)
                {
                  tx.commit
                  (
                    function(err)
                    {
                      if (!err)
                      {
                        done();
                        world.spark.emit(world.eventname, {rc: global.errcode_none, msg: global.text_success, pdata: world.pdata});
                        global.pr.sendToRoomExcept(global.custchannelprefix + world.cn.custid, 'discountcodeexpired', {discountcodeid: world.discountcodeid}, world.spark.id);
                      }
                      else
                      {
                        tx.rollback
                        (
                          function(ignore)
                          {
                            done();
                            msg += global.text_tx + ' ' + err.message;
                            global.log.error({expirediscountcode: true}, msg);
                            world.spark.emit(global.eventerror, {rc: global.errcode_dberr, msg: msg, pdata: world.pdata});
                          }
                        );
                      }
                    }
                  );
                }
              ).then
              (
                null,
                function(err)
                {
                  tx.rollback
                  (
                    function(ignore)
                    {
                      done();

                      msg += global.text_generalexception + ' ' + err.message;
                      global.log.error({expirediscountcode: true}, msg);
                      world.spark.emit(global.eventerror, {rc: global.errcode_fatal, msg: msg, pdata: world.pdata});
                    }
                  );
                }
              );
            }
            else
            {
              done();
              msg += global.text_notxstart + ' ' + err.message;
              global.log.error({expirediscountcode: true}, msg);
              world.spark.emit(global.eventerror, {rc: global.errcode_dberr, msg: msg, pdata: world.pdata});
            }
          }
        );
      }
      else
      {
        global.log.error({expirediscountcode: true}, global.text_nodbconnection);
        world.spark.emit(global.eventerror, {rc: global.errcode_dbunavail, msg: global.text_nodbconnection, pdata: world.pdata});
      }
    }
  );
}

function ListListPriceCode(world)
{
  var msg = '[' + world.eventname + '] ';
 
  global.pg.connect
  (
    global.cs,
    function(err, client, done)
    {
      if (!err)
      {
        client.query
        (
          'SELECT ' + 
          'l.id, ' + 
          'l.full_name, '+
          'l.short_name, '+
          'l.parameter,'+
          'l.usersmodified_id, l.datecreated, l.datemodified, ' + 
          'u1.name usercreated, '+
          'u2.name usermodified ' +
          'from listpricecode l left join users u1 on (l.userscreated_id=u1.id) '+
                              'left join users u2 on (l.usersmodified_id=u2.id) '+
          'where l.dateexpired is null ' + 
          'order by '+
          'l.id',
          function(err, result)
          {
            done();

            if (!err)
            {
              // JS returns date with TZ info/format, need in ISO format...
              result.rows.forEach
              (
                function(p)
                {
                  //global.ConsoleLog(p);
                  if (!__.isUndefined(p.datemodified) && !__.isNull(p.datemodified))
                    p.datemodified = global.moment(p.datemodified).format('YYYY-MM-DD HH:mm:ss');

                  p.datecreated = global.moment(p.datecreated).format('YYYY-MM-DD HH:mm:ss');
                }
              );

              world.spark.emit(world.eventname, {rc: global.errcode_none, msg: global.text_success, fguid: world.fguid, rs: result.rows, pdata: world.pdata});
            }
            else
            {
              msg += global.text_generalexception + ' ' + err.message;
              global.log.error({listlistpricecode: true}, msg);
              world.spark.emit(global.eventerror, {rc: global.errcode_fatal, msg: msg, pdata: world.pdata});
            }
          }
        );
      }
      else
      {
        global.log.error({listlistpricecode: true}, global.text_nodbconnection);
        world.spark.emit(global.eventerror, {rc: global.errcode_dbunavail, msg: global.text_nodbconnection, pdata: world.pdata});
      }
    }
  );
}

function NewListPriceCode(world)
{
  var msg = '[' + world.eventname + '] ';
  //
  global.pg.connect
  (
    global.cs,
    function(err, client, done)
    {
      if (!err)
      {
        var tx = new global.pgtx(client);
        tx.begin
        (
          function(err)
          {
            if (!err)
            {
              doNewListPriceCode(tx, world).then
              (
                function(result)
                {
                  tx.commit
                  (
                    function(err)
                    {
                      if (!err)
                      {
                        done();
                        world.spark.emit
                        (
                          world.eventname,
                          {
                            rc: global.errcode_none,
                            msg: global.text_success,
                            listpricecodeid: result.listpricecodeid,
                            // productid: world.productid,
                            datecreated: result.datecreated,
                            usercreated: result.usercreated,
                            pdata: world.pdata
                          }
                        );
                        global.pr.sendToRoomExcept
                        (
                          global.custchannelprefix + world.cn.custid,
                          'newlistpricecode',
                          {
                            listpricecodeid: result.listpricecodeid,
                            // productid: world.productid,
                            datecreated: result.datecreated,
                            usercreated: result.usercreated
                          },
                          world.spark.id
                        );
                      }
                      else
                      {
                        tx.rollback
                        (
                          function(ignore)
                          {
                            done();
                            msg += global.text_tx + ' ' + err.message;
                            global.log.error({newlistpricecode: true}, msg);
                            world.spark.emit(global.eventerror, {rc: global.errcode_dberr, msg: msg, pdata: world.pdata});
                          }
                        );
                      }
                    }
                  );
                }
              ).then
              (
                null,
                function(err)
                {
                  tx.rollback
                  (
                    function(ignore)
                    {
                      done();

                      msg += global.text_generalexception + ' ' + err.message;
                      global.log.error({newlistpricecode: true}, msg);
                      world.spark.emit(global.eventerror, {rc: global.errcode_fatal, msg: msg, pdata: world.pdata});
                    }
                  );
                }
              );
            }
            else
            {
              done();
              msg += global.text_notxstart + ' ' + err.message;
              global.log.error({newlistpricecode: true}, msg);
              world.spark.emit(global.eventerror, {rc: global.errcode_dberr, msg: msg, pdata: world.pdata});
            }
          }
        );
      }
      else
      {
        global.log.error({newlistpricecode: true}, global.text_nodbconnection);
        world.spark.emit(global.eventerror, {rc: global.errcode_dbunavail, msg: global.text_nodbconnection, pdata: world.pdata});
      }
    }
  );
}

function SaveListPriceCode(world)
{
  var msg = '[' + world.eventname + '] ';
  //
  global.pg.connect
  (
    global.cs,
    function(err, client, done)
    {
      if (!err)
      {
        var tx = new global.pgtx(client);
        tx.begin
        (
          function(err)
          {
            if (!err)
            {
              doSaveListPriceCode(tx, world).then
              (
                function(result)
                {
                  tx.commit
                  (
                    function(err)
                    {
                      if (!err)
                      {
                        done();
                        world.spark.emit(world.eventname, {rc: global.errcode_none, msg: global.text_success, listpricecodeid: result.listpricecodeid, datemodified: result.datemodified, usermodified: result.usermodified, pdata: world.pdata});
                        global.pr.sendToRoomExcept(global.custchannelprefix + world.cn.custid, 'listpricecodesaved', {listpricecodeid: result.listpricecodeid, datecreated: result.datecreated, usercreated: result.usercreated}, world.spark.id);
                      }
                      else
                      {
                        tx.rollback
                        (
                          function(ignore)
                          {
                            done();
                            msg += global.text_tx + ' ' + err.message;
                            global.log.error({savelistpricecode: true}, msg);
                            world.spark.emit(global.eventerror, {rc: global.errcode_dberr, msg: msg, pdata: world.pdata});
                          }
                        );
                      }
                    }
                  );
                }
              ).then
              (
                null,
                function(err)
                {
                  tx.rollback
                  (
                    function(ignore)
                    {
                      done();

                      msg += global.text_generalexception + ' ' + err.message;
                      global.log.error({savelistpricecode: true}, msg);
                      world.spark.emit(global.eventerror, {rc: global.errcode_fatal, msg: msg, pdata: world.pdata});
                    }
                  );
                }
              );
            }
            else
            {
              done();
              msg += global.text_notxstart + ' ' + err.message;
              global.log.error({savelistpricecode: true}, msg);
              world.spark.emit(global.eventerror, {rc: global.errcode_dberr, msg: msg, pdata: world.pdata});
            }
          }
        );
      }
      else
      {
        global.log.error({savelistpricecode: true}, global.text_nodbconnection);
        world.spark.emit(global.eventerror, {rc: global.errcode_dbunavail, msg: global.text_nodbconnection, pdata: world.pdata});
      }
    }
  );
}

function ExpireListPriceCode(world)
{
  var msg = '[' + world.eventname + '] ';
  //
  global.pg.connect
  (
    global.cs,
    function(err, client, done)
    {
      if (!err)
      {
        var tx = new global.pgtx(client);
        tx.begin
        (
          function(err)
          {
            if (!err)
            {
              doExpireListPriceCode(tx, world).then
              (
                function(result)
                {
                  tx.commit
                  (
                    function(err)
                    {
                      if (!err)
                      {
                        done();
                        world.spark.emit(world.eventname, {rc: global.errcode_none, msg: global.text_success, pdata: world.pdata});
                        global.pr.sendToRoomExcept(global.custchannelprefix + world.cn.custid, 'listpricecodeexpired', {listpricecodeid: world.listpricecodeid}, world.spark.id);
                      }
                      else
                      {
                        tx.rollback
                        (
                          function(ignore)
                          {
                            done();
                            msg += global.text_tx + ' ' + err.message;
                            global.log.error({expirelistpricecode: true}, msg);
                            world.spark.emit(global.eventerror, {rc: global.errcode_dberr, msg: msg, pdata: world.pdata});
                          }
                        );
                      }
                    }
                  );
                }
              ).then
              (
                null,
                function(err)
                {
                  tx.rollback
                  (
                    function(ignore)
                    {
                      done();

                      msg += global.text_generalexception + ' ' + err.message;
                      global.log.error({expirelistpricecode: true}, msg);
                      world.spark.emit(global.eventerror, {rc: global.errcode_fatal, msg: msg, pdata: world.pdata});
                    }
                  );
                }
              );
            }
            else
            {
              done();
              msg += global.text_notxstart + ' ' + err.message;
              global.log.error({expirelistpricecode: true}, msg);
              world.spark.emit(global.eventerror, {rc: global.errcode_dberr, msg: msg, pdata: world.pdata});
            }
          }
        );
      }
      else
      {
        global.log.error({expirelistpricecode: true}, global.text_nodbconnection);
        world.spark.emit(global.eventerror, {rc: global.errcode_dbunavail, msg: global.text_nodbconnection, pdata: world.pdata});
      }
    }
  );
}

// *******************************************************************************************************************************************************************************************
// Internal functions
module.exports.doSelectPrice = doSelectPrice;
module.exports.doNewBuildTemplateStep1 = doNewBuildTemplateStep1;
module.exports.doNewBuildTemplateStep2 = doNewBuildTemplateStep2;

// *******************************************************************************************************************************************************************************************
// Public functions
module.exports.ListProductCategories = ListProductCategories;
module.exports.LoadProductCategory = LoadProductCategory;
module.exports.NewProductCategory = NewProductCategory;
module.exports.SaveProductCategory = SaveProductCategory;
module.exports.ChangeProductCategoryParent = ChangeProductCategoryParent;
module.exports.ExpireProductCategory = ExpireProductCategory;
module.exports.CheckProductCategoryCode = CheckProductCategoryCode;

module.exports.ListProducts = ListProducts;
module.exports.ListProductsByCategory = ListProductsByCategory;
module.exports.LoadProduct = LoadProduct;
module.exports.NewProduct = NewProduct;
module.exports.SaveProduct = SaveProduct;
module.exports.DuplicateProduct = DuplicateProduct;
module.exports.CheckProductCode = CheckProductCode;
module.exports.ChangeProductCategory = ChangeProductCategory;
module.exports.ExpireProduct = ExpireProduct;
module.exports.SearchProducts = SearchProducts;

module.exports.ListProductCodes = ListProductCodes;
module.exports.NewProductCode = NewProductCode;
module.exports.ExpireProductCode = ExpireProductCode;

module.exports.ListProductPricing = ListProductPricing;
module.exports.NewProductPricing = NewProductPricing;
module.exports.SaveProductPricing = SaveProductPricing;
module.exports.ExpireProductPricing = ExpireProductPricing;

// module.exports.ListBuildTemplates = ListBuildTemplates;
module.exports.SearchBuildTemplates_ByCodeAndName = SearchBuildTemplates_ByCodeAndName;
module.exports.SearchRootBuildTemplates_ByCodeAndName = SearchRootBuildTemplates_ByCodeAndName;
module.exports.ListBuildTemplates_ByParentID = ListBuildTemplates_ByParentID;
module.exports.ListBuildTemplateRoots = ListBuildTemplateRoots;
module.exports.BuildTemplateGetChildren = BuildTemplateGetChildren;
module.exports.NewBuildTemplate = NewBuildTemplate;
module.exports.SaveBuildTemplate = SaveBuildTemplate;
module.exports.CheckBuildTemplateCode = CheckBuildTemplateCode;

module.exports.ListProductsByBuildTemplate = ListProductsByBuildTemplate;
module.exports.DuplicateBuildTemplate = DuplicateBuildTemplate;
module.exports.ExpireBuildTemplate = ExpireBuildTemplate;
module.exports.ChangeBuildTemplateParent = ChangeBuildTemplateParent;
module.exports.SyncBuildTemplate = SyncBuildTemplate;
module.exports.SyncBuildTemplatesToMaster = SyncBuildTemplatesToMaster;
module.exports.SearchBuildTemplates = SearchBuildTemplates;

/*
module.exports.BuildBuildTemplate = BuildBuildTemplate;
*/

module.exports.NewBuildTemplateDetail = NewBuildTemplateDetail;
module.exports.SaveBuildTemplateDetail = SaveBuildTemplateDetail;
module.exports.ExpireBuildTemplateDetail = ExpireBuildTemplateDetail;

//
module.exports.SyncBuildTemplateFromProductTemplate = SyncBuildTemplateFromProductTemplate;
module.exports.ListBuildTemplates_Pagination = ListBuildTemplates_Pagination;
module.exports.ListProductTemplates = ListProductTemplates;
module.exports.NewProductTemplate = NewProductTemplate;
module.exports.SaveProductTemplate = SaveProductTemplate;
module.exports.ChangeProductTemplateParent = ChangeProductTemplateParent;
module.exports.ExpireProductTemplate = ExpireProductTemplate;
module.exports.DuplicateProductTemplate = DuplicateProductTemplate;
module.exports.SyncProductTemplate = SyncProductTemplate;
module.exports.BuildProductTemplate = BuildProductTemplate;

module.exports.ListProductsByTemplate = ListProductsByTemplate;
module.exports.ListProductsForBuild = ListProductsForBuild;
module.exports.NewProductTemplateDetail = NewProductTemplateDetail;
module.exports.SaveProductTemplateDetail = SaveProductTemplateDetail;
module.exports.ExpireProductTemplateDetail = ExpireProductTemplateDetail;
module.exports.GetProductPrices = GetProductPrices;
module.exports.GetPrice = GetPrice;


module.exports.ListDiscountCode = ListDiscountCode;
module.exports.NewDiscountCode = NewDiscountCode;
module.exports.SaveDiscountCode = SaveDiscountCode;
module.exports.ExpireDiscountCode = ExpireDiscountCode;

module.exports.ListListPriceCode = ListListPriceCode;
module.exports.NewListPriceCode = NewListPriceCode;
module.exports.SaveListPriceCode = SaveListPriceCode;
module.exports.ExpireListPriceCode = ExpireListPriceCode;
