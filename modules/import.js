// *******************************************************************************************************************************************************************************************
// Internal functions
function doImportTPCCGetProductCategory(tx, custid, entry)
{
  var promise = new global.rsvp.Promise
  (
    function(resolve, reject)
    {
      if (global.config.env.customer == 'tpcc')
      {
        var components = entry.itemno.split('_');
        var clientcode = components[0];
                            
        tx.query
        (
          'select pc1.id from productcategories pc1 left join clients c1 on (pc1.code=c1.code) where pc1.customers_id=$1 and pc1.dateexpired is null and c1.code=$2',
          [
            custid,
            __.sanitiseAsString(clientcode)
          ],
          function(err, result)
          {
            if (!err)
            {
              if (__.isUN(result.rows) || (result.rows.length == 0) || __.isNull(result.rows[0].id))
                resolve(null);
              else
              {
                // Found a product category matching client code, so now we
                // convert old style to new style product codes...
                entry.itemno = components[2] + components[3] + '-' + components[4];
                resolve(result.rows[0].id);
              }
            }
            else
              reject(err);
          }
        );
      }
      else
        resolve(null);
    }
  );
  return promise;
}

function doImportInsertOrUpdateProductCategory(tx, world, entry)
{
  var promise = new global.rsvp.Promise
  (
    function(resolve, reject)
    {
      tx.query
      (
        'select pc1.id from productcategories pc1 where pc1.customers_id=$1 and upper(pc1.code)=upper($2) and pc1.dateexpired is null',
        [
          world.cn.custid,
          entry.itemgroup
        ],
        function(err, result)
        {
          if (!err)
          {
            var categoryid = __.isUN(result.rows) || (result.rows.length == 0) ? null : result.rows[0].id;

            if (__.isNull(categoryid))
            {
              tx.query
              (
                'insert into productcategories (customers_id,code,name,userscreated_id) values ($1,$2,$3,$4) returning id',
                [
                  world.cn.custid,
                  __.sanitiseAsString(entry.itemgroup, 50),
                  __.sanitiseAsString(entry.itemgroup, 50),
                  world.cn.userid
                ],
                function(err, result)
                {
                  if (!err)
                  {
                    categoryid = result.rows[0].id;

                    resolve(categoryid);
                  }
                  else
                    reject(err);
                }
              );
            }
            else
              resolve(categoryid);
          }
        }
      );
    }
  );
  return promise;
}

function doImportInsertOrUpdateProduct(tx, world, entry)
{
  var promise = new global.rsvp.Promise
  (
    function(resolve, reject)
    {
      tx.query
      (
        'select p1.id from products p1 where p1.customers_id=$1 and p1.code=$2 and p1.dateexpired is null',
        [
          world.cn.custid,
          entry.itemno
        ],
        function(err, result)
        {
          if (!err)
          {
            var productid = __.isUN(result.rows) || (result.rows.length == 0) ? null : result.rows[0].id;

            if (__.isNull(productid))
            {
              //console.log('***** Inserting new product: ' + entry.itemno);
              tx.query
              (
                'insert into products (customers_id,productcategories_id,code,name,uom,uomsize,minstockqty,attrib1,attrib2,attrib3,attrib4,attrib5,notes,costprice,costgst,buytaxcodes_id,selltaxcodes_id,costofgoodsaccounts_id,incomeaccounts_id,assetaccounts_id,userscreated_id) values ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,calctaxcomponent($15,$16,$17),$18,$19,$20,$21,$22,$23) returning id',
                [
                  world.cn.custid,
                  __.sanitiseAsBigInt(world.productcategoryid),
                  __.sanitiseAsString(entry.itemno, 50),
                  __.sanitiseAsString(entry.itemname, 50),
                  __.sanitiseAsString(entry.sellinguom),
                  __.notNullNumeric(entry.uomsize),
                  __.notNullNumeric(entry.minlevel),
                  __.sanitiseAsString(entry.customfield1, 50),
                  __.sanitiseAsString(entry.customfield2, 50),
                  __.sanitiseAsString(entry.customfield3, 50),
                  null,
                  null,
                  __.sanitiseAsString(entry.description, 2000),
                  __.notNullNumeric(entry.standardcost),
                  //
                  world.cn.custid,
                  __.notNullNumeric(entry.standardcost),
                  __.sanitiseAsBigInt(entry.buytaxcodeid),
                  //
                  __.sanitiseAsBigInt(entry.buytaxcodeid),
                  __.sanitiseAsBigInt(entry.selltaxcodeid),
                  //
                  __.sanitiseAsBigInt(entry.costofgoodsaccountid),
                  __.sanitiseAsBigInt(entry.incomeaccountid),
                  __.sanitiseAsBigInt(entry.assetaccountid),
                  world.cn.userid
                ],
                function(err, result)
                {
                  if (!err)
                  {
                    productid = result.rows[0].id;

                    world.numinserted++;
                    resolve(productid);
                  }
                  else
                    reject(err);
                }
              );
            }
            else
            {
              tx.query
              (
                'update products set name=$1,uom=$2,uomsize=$3,minstockqty=$4,attrib1=$5,attrib2=$6,attrib3=$7,attrib4=$8,attrib5=$9,notes=$10,costprice=$11,costgst=calctaxcomponent($12,$13,$14),buytaxcodes_id=$15,selltaxcodes_id=$16,costofgoodsaccounts_id=$17,incomeaccounts_id=$18,assetaccounts_id=$19,datemodified=now(),userscreated_id=$20 where customers_id=$21 and id=$22',
                [
                  __.sanitiseAsString(entry.itemname, 50),
                  __.sanitiseAsString(entry.sellinguom),
                  __.notNullNumeric(entry.uomsize),
                  __.notNullNumeric(entry.minlevel),
                  __.sanitiseAsString(entry.customfield1, 50),
                  __.sanitiseAsString(entry.customfield2, 50),
                  __.sanitiseAsString(entry.customfield3, 50),
                  null,
                  null,
                  __.sanitiseAsString(entry.description, 2000),
                  __.notNullNumeric(entry.standardcost),
                  //
                  world.cn.custid,
                  __.notNullNumeric(entry.standardcost),
                  __.sanitiseAsBigInt(entry.buytaxcodeid),
                  //
                  __.sanitiseAsBigInt(entry.buytaxcodeid),
                  __.sanitiseAsBigInt(entry.selltaxcodeid),
                  //
                  __.sanitiseAsBigInt(entry.costofgoodsaccountid),
                  __.sanitiseAsBigInt(entry.incomeaccountid),
                  __.sanitiseAsBigInt(entry.assetaccountid),
                  //
                  world.cn.userid,
                  world.cn.custid,
                  __.sanitiseAsBigInt(productid)
                ],
                function(err, result)
                {
                  if (!err)
                  {
                    world.numupdated++;
                    resolve(productid);
                  }
                  else
                    reject(err);
                }
              );
            }
          }
        }
      );
    }
  );
  return promise;
}

function doImportInsertPrice(tx, world, entry)
{
  var promise = new global.rsvp.Promise
  (
    function(resolve, reject)
    {
      // If price already exists, skip...
      tx.query
      (
        'select p1.id from pricing p1 where p1.customers_id=$1 and products_id=$2 and price=$3 and p1.dateexpired is null',
        [
          world.cn.custid,
          __.sanitiseAsBigInt(entry.productid),
          __.sanitiseAsPrice(entry.sellingprice, 4)
        ],
        function(err, result)
        {
          if (!err)
          {
            if (!__.isUndefined(result.rows) && (result.rows.length == 0))
            {
              tx.query
              (
                'insert into pricing (customers_id,products_id,price,gst,userscreated_id) values ($1,$2,$3,calctaxcomponent($4,$5,$6),$7) returning id',
                [
                  world.cn.custid,
                  __.sanitiseAsBigInt(entry.productid),
                  __.sanitiseAsPrice(entry.sellingprice, 4),
                  //
                  world.cn.custid,
                  __.sanitiseAsPrice(entry.sellingprice, 4),
                  __.sanitiseAsBigInt(entry.selltaxcodeid),
                  //
                  world.cn.userid
                ],
                function(err, result)
                {
                  if (!err)
                  {
                    var pricingid = result.rows[0].id;

                    resolve(pricingid);
                  }
                  else
                    reject(err);
                }
              );
            }
            else
              resolve(result.rows[0].id);
          }
          else
            reject(err);
        }
      );
    }
  );
  return promise;
}

function doImportInsertOrUpdateClient(tx, world, entry)
{
  var promise = new global.rsvp.Promise
  (
    function(resolve, reject)
    {
      tx.query
      (
        'select c1.id from clients c1 where c1.customers_id=$1 and c1.code=$2 and c1.dateexpired is null',
        [
          world.cn.custid,
          entry.cardid
        ],
        function(err, result)
        {
          if (!err)
          {
            var clientid = __.isUN(result.rows) || (result.rows.length == 0) ? null : result.rows[0].id;

            if (__.isNull(clientid))
            {
              tx.query
              (
                'insert into clients (customers_id,code,name,url1,url2,email1,email2,phone1,phone2,fax1,fax2,contact1,contact2,address1,address2,address3,address4,city,state,postcode,country,shipaddress1,shipaddress2,shipaddress3,shipaddress4,shipcity,shipstate,shippostcode,shipcountry,bankbsb,bankaccountno,bankaccountname,companycode,dayscredit,creditlimit,notes,isclient,issupplier,userscreated_id) values ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,$21,$22,$23,$24,$25,$26,$27,$28,$29,$30,$31,$32,$33,$34,$35,$36,$37,$38,$39) returning id',
                [
                  world.cn.custid,
                  __.sanitiseAsString(entry.cardid, 50),
                  __.sanitiseAsString(entry.company, 50),
                  __.sanitiseAsString(entry.contact1www, 100),
                  __.sanitiseAsString(entry.contact2www, 100),
                  __.sanitiseAsString(entry.contact1email, 100),
                  __.sanitiseAsString(entry.contact2email, 100),
                  __.sanitiseAsString(entry.contact1phone1, 20),
                  __.sanitiseAsString(entry.contact2phone1, 20),
                  __.sanitiseAsString(entry.contact1fax, 20),
                  __.sanitiseAsString(entry.contact2fax, 20),
                  __.sanitiseAsString(entry.contact1name, 50),
                  __.sanitiseAsString(entry.contact2name, 50),
                  __.sanitiseAsString(entry.contact1address1, 50),
                  __.sanitiseAsString(entry.contact1address2, 50),
                  __.sanitiseAsString(entry.contact1address3, 50),
                  __.sanitiseAsString(entry.contact1address4, 50),
                  __.sanitiseAsString(entry.contact1city, 50),
                  __.sanitiseAsString(entry.contact1state, 50),
                  __.sanitiseAsString(entry.contact1postcode, 50),
                  __.sanitiseAsString(entry.contact1country, 50),
                  __.sanitiseAsString(entry.contact2address1, 50),
                  __.sanitiseAsString(entry.contact2address2, 50),
                  __.sanitiseAsString(entry.contact2address3, 50),
                  __.sanitiseAsString(entry.contact2address4, 50),
                  __.sanitiseAsString(entry.contact2city, 50),
                  __.sanitiseAsString(entry.contact2state, 50),
                  __.sanitiseAsString(entry.contact2postcode, 50),
                  __.sanitiseAsString(entry.contact2country, 50),
                  __.sanitiseAsString(entry.bsb, 20),
                  __.sanitiseAsString(entry.acctno, 20),
                  __.sanitiseAsString(entry.acctname, 50),
                  __.sanitiseAsString(entry.abn, 20),
                  __.sanitiseAsBigInt(entry.balanceduedays),
                  __.notNullNumeric(entry.creditlimit, 4),
                  __.sanitiseAsString(entry.notes, 2000),
                  __.sanitiseAsBool(entry.isclient),
                  __.sanitiseAsBool(entry.issupplier),
                  world.cn.userid
                ],
                function(err, result)
                {
                  if (!err)
                  {
                    clientid = result.rows[0].id;

                    world.numinserted++;
                    resolve(clientid);
                  }
                  else
                    reject(err);
                }
              );
            }
            else
            {
              tx.query
              (
                'update clients set name=$1,url1=$2,url2=$3,email1=$4,email2=$5,phone1=$6,phone2=$7,fax1=$8,fax2=$9,contact1=$10,contact2=$11,address1=$12,address2=$13,address3=$14,address4=$15,city=$16,state=$17,postcode=$18,country=$19,shipaddress1=$20,shipaddress2=$21,shipaddress3=$22,shipaddress4=$23,shipcity=$24,shipstate=$25,shippostcode=$26,shipcountry=$27,bankbsb=$28,bankaccountno=$29,bankaccountname=$30,companycode=$31,dayscredit=$32,creditlimit=$33,notes=$34,isclient=$35,issupplier=$36,userscreated_id=$37 where customers_id=$38 and id=$39',
                [
                  __.sanitiseAsString(entry.company, 50),
                  __.sanitiseAsString(entry.contact1www, 100),
                  __.sanitiseAsString(entry.contact2www, 100),
                  __.sanitiseAsString(entry.contact1email, 100),
                  __.sanitiseAsString(entry.contact2email, 100),
                  __.sanitiseAsString(entry.contact1phone1, 20),
                  __.sanitiseAsString(entry.contact2phone1, 20),
                  __.sanitiseAsString(entry.contact1fax, 20),
                  __.sanitiseAsString(entry.contact2fax, 20),
                  __.sanitiseAsString(entry.contact1name, 50),
                  __.sanitiseAsString(entry.contact2name, 50),
                  __.sanitiseAsString(entry.contact1address1, 50),
                  __.sanitiseAsString(entry.contact1address2, 50),
                  __.sanitiseAsString(entry.contact1address3, 50),
                  __.sanitiseAsString(entry.contact1address4, 50),
                  __.sanitiseAsString(entry.contact1city, 50),
                  __.sanitiseAsString(entry.contact1state, 50),
                  __.sanitiseAsString(entry.contact1postcode, 50),
                  __.sanitiseAsString(entry.contact1country, 50),
                  __.sanitiseAsString(entry.contact2address1, 50),
                  __.sanitiseAsString(entry.contact2address2, 50),
                  __.sanitiseAsString(entry.contact2address3, 50),
                  __.sanitiseAsString(entry.contact2address4, 50),
                  __.sanitiseAsString(entry.contact2city, 50),
                  __.sanitiseAsString(entry.contact2state, 50),
                  __.sanitiseAsString(entry.contact2postcode, 50),
                  __.sanitiseAsString(entry.contact2country, 50),
                  __.sanitiseAsString(entry.bsb, 20),
                  __.sanitiseAsString(entry.acctno, 20),
                  __.sanitiseAsString(entry.acctname, 50),
                  __.sanitiseAsString(entry.abn, 20),
                  __.sanitiseAsBigInt(entry.balanceduedays),
                  __.notNullNumeric(entry.creditlimit, 4),
                  __.sanitiseAsString(entry.notes, 2000),
                  __.sanitiseAsBool(entry.isclient),
                  __.sanitiseAsBool(entry.issupplier),
                  world.cn.userid,
                  world.cn.custid,
                  __.sanitiseAsBigInt(clientid)
                ],
                function(err, result)
                {
                  if (!err)
                  {
                    world.numupdated++;
                    resolve(clientid);
                  }
                  else
                    reject(err);
                }
              );
            }
          }
        }
      );
    }
  );
  return promise;
}

function doImportInsertOrUpdateEmployee(tx, world, entry)
{
  var promise = new global.rsvp.Promise
  (
    function(resolve, reject)
    {
      tx.query
      (
        'select e1.id from employees e1 where e1.customers_id=$1 and upper(e1.lastname)=upper($2) and upper(e1.firstname)=upper($3) and e1.dob=$4 and e1.dateexpired is null',
        [
          world.cn.custid,
          entry.lastname,
          entry.firstname,
          entry.dob
        ],
        function(err, result)
        {
          if (!err)
          {
            var employeeid = __.isUN(result.rows) || (result.rows.length == 0) ? null : result.rows[0].id;

            if (__.isNull(employeeid))
            {
              tx.query
              (
                'insert into employees (customers_id,lastname,firstname,notes,email1,phone1,phone2,address1,address2,city,state,postcode,country,bankbsb,bankaccountno,bankaccountname,gender,startdate,payamount,payrate,payfrequency,paystdperiod,wageaccounts_id,superfunds_id,taxfileno,taxtable,employmenttype,employmentstatus,title,membershipno1,dob,employmentclassification,userscreated_id) values ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,$21,$22,$23,$24,$25,$26,$27,$28,$29,$30,$31,$32,$33) returning id',
                [
                  world.cn.custid,
                  __.sanitiseAsString(entry.lastname, 50),
                  __.sanitiseAsString(entry.firstname, 100),
                  __.sanitiseAsComment(entry.notes, 200),
                  __.sanitiseAsString(entry.email, 100),
                  __.sanitiseAsString(entry.phone1, 20),
                  __.sanitiseAsString(entry.phone2, 20),
                  __.sanitiseAsString(entry.addr1, 50),
                  __.sanitiseAsString(entry.addr2, 50),
                  __.sanitiseAsString(entry.city, 50),
                  __.sanitiseAsString(entry.state, 50),
                  __.sanitiseAsString(entry.postcode, 50),
                  __.sanitiseAsString(entry.country, 50),
                  __.sanitiseAsString(entry.bsb, 20),
                  __.sanitiseAsString(entry.acctnumber, 20),
                  __.sanitiseAsString(entry.acctname, 50),
                  __.sanitiseAsString(entry.gender, 2),
                  entry.startdate,
                  __.notNullNumeric(entry.salaryrate, 4),
                  entry.paybasis,
                  entry.payfrequency,
                  __.notNullNumeric(entry.housinpayperiod, 4),
                  __.sanitiseAsBigInt(entry.wageaccountid),
                  __.sanitiseAsBigInt(entry.superfundid),
                  __.sanitiseAsString(entry.tfn, 50),
                  entry.taxtable,
                  entry.employmentstatus,
                  global.itype_employmentstatus_employed,
                  __.sanitiseAsString(entry.salutation, 50),
                  __.sanitiseAsString(entry.employeemembershipno, 50),
                  entry.dob,
                  __.sanitiseAsString(entry.employmentclassification, 50),
                  world.cn.userid
                ],
                function(err, result)
                {
                  if (!err)
                  {
                    employeeid = result.rows[0].id;

                    world.numinserted++;
                    resolve(employeeid);
                  }
                  else
                    reject(err);
                }
              );
            }
            else
            {
              tx.query
              (
                'update employees set notes=$1,email1=$2,phone1=$3,phone2=$4,address1=$5,address2=$6,city=$7,state=$8,postcode=$9,country=$10,bankbsb=$11,bankaccountno=$12,bankaccountname=$13,gender=$14,startdate=$15,payamount=$16,payrate=$17,payfrequency=$18,paystdperiod=$19,wageaccounts_id=$20,superfunds_id=$21,taxfileno=$22,taxtable=$23,employmenttype=$24,employmentstatus=$25,title=$26,membershipno1=$27,dob=$28,employmentclassification=$29,usersmodified_id=$30 where customers_id=$31 and id=$32',
                [
                  __.sanitiseAsComment(entry.notes, 200),
                  __.sanitiseAsString(entry.email, 100),
                  __.sanitiseAsString(entry.phone1, 20),
                  __.sanitiseAsString(entry.phone2, 20),
                  __.sanitiseAsString(entry.addr1, 50),
                  __.sanitiseAsString(entry.addr2, 50),
                  __.sanitiseAsString(entry.city, 50),
                  __.sanitiseAsString(entry.state, 50),
                  __.sanitiseAsString(entry.postcode, 50),
                  __.sanitiseAsString(entry.country, 50),
                  __.sanitiseAsString(entry.bsb, 20),
                  __.sanitiseAsString(entry.acctnumber, 20),
                  __.sanitiseAsString(entry.acctname, 50),
                  __.sanitiseAsString(entry.gender, 2),
                  entry.startdate,
                  __.notNullNumeric(entry.salaryrate, 4),
                  entry.paybasis,
                  entry.payfrequency,
                  __.notNullNumeric(entry.housinpayperiod, 4),
                  __.sanitiseAsBigInt(entry.wageaccountid),
                  __.sanitiseAsBigInt(entry.superfundid),
                  __.sanitiseAsString(entry.tfn, 50),
                  entry.taxtable,
                  entry.employmentstatus,
                  global.itype_employmentstatus_employed,
                  __.sanitiseAsString(entry.salutation, 50),
                  __.sanitiseAsString(entry.employeemembershipno, 50),
                  entry.dob,
                  __.sanitiseAsString(entry.employmentclassification, 50),
                  world.cn.userid,
                  world.cn.custid,
                  employeeid
                ],
                function(err, result)
                {
                  if (!err)
                  {
                    world.numupdated++;
                    resolve(employeeid);
                  }
                  else
                    reject(err);
                }
              );
            }
          }
        }
      );
    }
  );
  return promise;
}

function doImportInsertOrUpdateAccount(tx, world, entry)
{
  var promise = new global.rsvp.Promise
  (
    function(resolve, reject)
    {
      tx.query
      (
        'select a1.id from accounts a1 where a1.customers_id=$1 and upper(a1.code)=upper($2) and a1.dateexpired is null',
        [
          world.cn.custid,
          entry.code
        ],
        function(err, result)
        {
          if (!err)
          {
            var accountid = __.isUN(result.rows) || (result.rows.length == 0) ? null : result.rows[0].id;

            if (__.isNull(accountid))
            {
              tx.query
              (
                'insert into accounts (customers_id,code,name,notes,itype,taxcodes_id,userscreated_id) values ($1,$2,$3,$4,$5,$6,$7) returning id',
                [
                  world.cn.custid,
                  __.sanitiseAsString(entry.code, 50),
                  __.sanitiseAsString(entry.name, 100),
                  __.sanitiseAsComment(entry.description, 200),
                  entry.type,
                  __.sanitiseAsBigInt(entry.taxcodeid),
                  world.cn.userid
                ],
                function(err, result)
                {
                  if (!err)
                  {
                    accountid = result.rows[0].id;

                    world.numinserted++;
                    resolve(accountid);
                  }
                  else
                    reject(err);
                }
              );
            }
            else
            {
              tx.query
              (
                'update accounts set code=$1,name=$2,notes=$3,itype=$4,taxcodes_id=$5,usersmodified_id=$6 where customers_id=$7 and id=$8',
                [
                  __.sanitiseAsString(entry.code, 50),
                  __.sanitiseAsString(entry.name, 100),
                  __.sanitiseAsComment(entry.description, 200),
                  entry.type,
                  __.sanitiseAsBigInt(entry.taxcodeid),
                  world.cn.userid,
                  world.cn.custid,
                  accountid
                ],
                function(err, result)
                {
                  if (!err)
                  {
                    world.numupdated++;
                    resolve(accountid);
                  }
                  else
                    reject(err);
                }
              );
            }
          }
        }
      );
    }
  );
  return promise;
}

// *******************************************************************************************************************************************************************************************
// Public functions
function ImportMyobProducts(args)
{
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
              // We need user id and customer id to insert new entry...
              // Find user in cache...
              global.users.get
              (
                global.config.redis.prefix + args.uuid,
                function(err, uuidobj)
                {
                  if (!err)
                  {
                    global.safejsonparse
                    (
                      uuidobj,
                      function(err, uo)
                      {
                        if (!err)
                        {
                          var xlobj = global.xlreader.parse(args.filename);
                          var rows = xlobj[0].data;
                          var calls = [];
                          var world =
                          {
                            productcategoryid: __.sanitiseAsBigInt(args.productcategoryid),
                            numinserted: 0,
                            numupdated: 0,
                            numskipped: 0,
                            cn:
                            {
                              custid: uo.custid,
                              userid: uo.userid
                            }
                          };

                          rows.forEach
                          (
                            function (cols, index)
                            {
                              // Skip header...
                              if (index == 0)
                                return;

                              var entry =
                              {
                                itemno: __.sanitiseAsTrimString(cols[0]),
                                itemname: __.sanitiseAsTrimString(cols[1]),
                                buy: __.sanitiseAsTrimString(cols[2]),
                                sell: __.sanitiseAsTrimString(cols[3]),
                                inventory: __.sanitiseAsTrimString(cols[4]),
                                assetacct: __.sanitiseAsTrimString(cols[5]),
                                incomeacct: __.sanitiseAsTrimString(cols[6]),
                                expenseacct: __.sanitiseAsTrimString(cols[7]),
                                itempicture: __.sanitiseAsTrimString(cols[8]),
                                description: __.sanitiseAsTrimString(cols[9]),
                                usedescriptiononsale: __.sanitiseAsTrimString(cols[10]),
                                customlist1: __.sanitiseAsTrimString(cols[11]),
                                customlist2: __.sanitiseAsTrimString(cols[12]),
                                customlist3: __.sanitiseAsTrimString(cols[13]),
                                customfield1: __.sanitiseAsTrimString(cols[14]),
                                customfield2: __.sanitiseAsTrimString(cols[15]),
                                customfield3: __.sanitiseAsTrimString(cols[16]),
                                primarysupplier: __.sanitiseAsTrimString(cols[17]),
                                supplierno: __.sanitiseAsTrimString(cols[18]),
                                buytaxcode: __.sanitiseAsTrimString(cols[19]),
                                buyuom: __.sanitiseAsTrimString(cols[20]),
                                itemsperbuyuom: __.sanitiseAsTrimString(cols[21]),
                                reorderqty: __.sanitiseAsTrimString(cols[22]),
                                minlevel: __.sanitiseAsTrimString(cols[23]),
                                sellingprice: __.sanitiseAsPrice(cols[24]),
                                sellinguom: __.sanitiseAsTrimString(cols[25]),
                                selltaxcode: __.sanitiseAsTrimString(cols[26]),
                                sellpriceinc: __.sanitiseAsTrimString(cols[27]),
                                salestaxcalcmethod: __.sanitiseAsTrimString(cols[28]),
                                itemsperselluom: __.sanitiseAsTrimString(cols[29]),
                                qtybreak1: __.sanitiseAsPrice(cols[30]),
                                qtybreak2: __.sanitiseAsPrice(cols[31]),
                                qtybreak3: __.sanitiseAsPrice(cols[32]),
                                qtybreak4: __.sanitiseAsPrice(cols[33]),
                                qtybreak5: __.sanitiseAsPrice(cols[34]),
                                priceabreak1: __.sanitiseAsPrice(cols[35]),
                                pricebbreak1: __.sanitiseAsPrice(cols[36]),
                                pricecbreak1: __.sanitiseAsPrice(cols[37]),
                                pricedbreak1: __.sanitiseAsPrice(cols[38]),
                                priceebreak1: __.sanitiseAsPrice(cols[39]),
                                pricefbreak1: __.sanitiseAsPrice(cols[40]),
                                priceabreak2: __.sanitiseAsPrice(cols[41]),
                                pricebbreak2: __.sanitiseAsPrice(cols[42]),
                                pricecbreak2: __.sanitiseAsPrice(cols[43]),
                                pricedbreak2: __.sanitiseAsPrice(cols[44]),
                                priceebreak2: __.sanitiseAsPrice(cols[45]),
                                pricefbreak2: __.sanitiseAsPrice(cols[46]),
                                priceabreak3: __.sanitiseAsPrice(cols[47]),
                                pricebbreak3: __.sanitiseAsPrice(cols[48]),
                                pricecbreak3: __.sanitiseAsPrice(cols[49]),
                                pricedbreak3: __.sanitiseAsPrice(cols[50]),
                                priceebreak3: __.sanitiseAsPrice(cols[51]),
                                pricefbreak3: __.sanitiseAsPrice(cols[52]),
                                priceabreak4: __.sanitiseAsPrice(cols[53]),
                                pricebbreak4: __.sanitiseAsPrice(cols[54]),
                                pricecbreak4: __.sanitiseAsPrice(cols[55]),
                                pricedbreak4: __.sanitiseAsPrice(cols[56]),
                                priceebreak4: __.sanitiseAsPrice(cols[57]),
                                pricefbreak4: __.sanitiseAsPrice(cols[58]),
                                priceabreak5: __.sanitiseAsPrice(cols[59]),
                                pricebbreak5: __.sanitiseAsPrice(cols[60]),
                                pricecbreak5: __.sanitiseAsPrice(cols[61]),
                                pricedbreak5: __.sanitiseAsPrice(cols[62]),
                                priceebreak5: __.sanitiseAsPrice(cols[63]),
                                pricefbreak5: __.sanitiseAsPrice(cols[64]),
                                inactive: __.sanitiseAsTrimString(cols[65]),
                                standardcost: __.sanitiseAsPrice(cols[66])
                              };

                              if (__.isNull(entry.itemno) || __.isNull(entry.itemname))
                              {
                                world.numskipped++;
                                return;
                              }

                              calls.push
                              (
                                function (callback)
                                {
                                  global.modaccounts.doFindAccountCode(tx, world.cn.custid, entry.assetacct).then
                                  (
                                    function(assetaccountid)
                                    {
                                      entry.assetaccountid = assetaccountid;
                                      return global.modaccounts.doFindAccountCode(tx, world.cn.custid, entry.incomeacct);
                                    }
                                  ).then
                                  (
                                    function(incomeaccountid)
                                    {
                                      entry.incomeaccountid = incomeaccountid;
                                      return global.modaccounts.doFindAccountCode(tx, world.cn.custid, entry.expenseacct);
                                    }
                                  ).then
                                  (
                                    function(costofgoodsaccountid)
                                    {
                                      entry.costofgoodsaccountid = costofgoodsaccountid;
                                      return global.modaccounts.doFindTaxCode(tx, world.cn.custid, entry.buytaxcode);
                                    }
                                  ).then
                                  (
                                    function(taxcodeid)
                                    {
                                      entry.buytaxcodeid = taxcodeid;
                                      return global.modaccounts.doFindTaxCode(tx, world.cn.custid, entry.selltaxcode);
                                    }
                                  ).then

                                  (
                                    function(taxcodeid)
                                    {
                                      entry.selltaxcodeid = taxcodeid;
                                      return doImportTPCCGetProductCategory(tx, world.cn.custid, entry);
                                    }
                                  ).then
                                  (
                                    function(productcategoryid)
                                    {
                                      if (!__.isNull(productcategoryid))
                                        world.productcategoryid = productcategoryid;

                                      return doImportInsertOrUpdateProduct(tx, world, entry);
                                    }
                                  ).then
                                  (
                                    function(productid)
                                    {
                                      entry.productid = productid;
                                      return doImportInsertPrice(tx, world, entry);
                                    }
                                  ).then
                                  (
                                    function(ignore)
                                    {
                                      callback(null, null);
                                    }
                                  ).then
                                  (
                                    null,
                                    function(err)
                                    {
                                      callback(null, err.message);
                                    }
                                  );
                                }
                              );
                            }
                          );

                          // Now process rows...
                          global.async.series
                          (
                            calls,
                            function(err, results)
                            {
                              if (!err)
                              {
                                var errors = [];

                                results.forEach
                                (
                                  function (row)
                                  {
                                    if (!__.isNull(row))
                                      errors.push(row);
                                  }
                                );

                                tx.commit
                                (
                                  function(err, ret)
                                  {
                                    if (!err)
                                    {
                                      done();
                                      global.log.info({importmyobproducts: true}, 'End import for: ' + world.filename);
                                      global.pr.sendToRoom(global.config.env.notificationschannel, 'productsimported', {filename: args.originalfilename, numinserted: world.numinserted, numupdated: world.numupdated, numskipped: world.numskipped});
                                    }
                                    else
                                    {
                                      tx.rollback
                                      (
                                        function(ignore)
                                        {
                                          done();
                                          global.log.error({importmyobproducts: true}, msg + global.text_committx + ' ' + err.message);
                                        }
                                      );
                                    }
                                  }
                                );
                              }
                              else
                              {
                                tx.rollback
                                (
                                  function(ignore)
                                  {
                                    done();
                                    global.log.error({importmyobproducts: true}, global.text_dbexception + ' ' + err.message);
                                  }
                                );
                              }
                            }
                          );
                        }
                        else
                        {
                          tx.rollback
                          (
                            function(ignore)
                            {
                              done();
                              global.log.error({importmyobproducts: true}, global.text_unablegetidfromuuid + ' ' + err.message);
                            }
                          );
                        }
                      }
                    );
                  }
                  else
                  {
                    tx.rollback
                    (
                      function(ignore)
                      {
                        done();
                        global.log.error({importmyobproducts: true}, global.text_unablegetidfromuuid + ' ' + err.message);
                      }
                    );
                  }
                }
              );
            }
            else
            {
              done();
              msg += global.text_notxstart + ' ' + err.message;
              global.log.error({importmyobproducts: true}, msg);
            }
          }
        );
      }
      else
      {
        done();
        global.log.error({importmyobproducts: true}, global.text_nodbconnection);
      }
    }
  );
}

function ImportMyobClients(args)
{
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
              // We need user id and customer id to insert new entry...
              // Find user in cache...
              global.users.get
              (
                global.config.redis.prefix + args.uuid,
                function(err, uuidobj)
                {
                  if (!err)
                  {
                    global.safejsonparse
                    (
                      uuidobj,
                      function(err, uo)
                      {
                        if (!err)
                        {
                          var xlobj = global.xlreader.parse(args.filename);
                          var rows = xlobj[0].data;
                          var calls = [];
                          var world =
                          {
                            numinserted: 0,
                            numupdated: 0,
                            numskipped: 0,
                            cn:
                            {
                              custid: uo.custid,
                              userid: uo.userid
                            }
                          };

                          rows.forEach
                          (
                            function(cols, index)
                            {
                              // Skip header...
                              if (index == 0)
                                return;

                              var entry =
                              {
                                company: __.sanitiseAsTrimString(cols[0]),
                                firstname: __.sanitiseAsTrimString(cols[1]),
                                cardid: __.sanitiseAsTrimString(cols[2]),
                                cardstatus: __.sanitiseAsTrimString(cols[3]),
                                currencycode: __.sanitiseAsTrimString(cols[4]),
                                contact1address1: __.sanitiseAsTrimString(cols[5]),
                                contact1address2: __.sanitiseAsTrimString(cols[6]),
                                contact1address3: __.sanitiseAsTrimString(cols[7]),
                                contact1address4: __.sanitiseAsTrimString(cols[8]),
                                contact1city: __.sanitiseAsTrimString(cols[9]),
                                contact1state: __.sanitiseAsTrimString(cols[10]),
                                contact1postcode: __.sanitiseAsTrimString(cols[11]),
                                contact1country: __.sanitiseAsTrimString(cols[12]),
                                contact1phone1: __.sanitiseAsTrimString(cols[13]),
                                contact1phone2: __.sanitiseAsTrimString(cols[14]),
                                contact1phone3: __.sanitiseAsTrimString(cols[15]),
                                contact1fax: __.sanitiseAsTrimString(cols[16]),
                                contact1email: __.sanitiseAsTrimString(cols[17]),
                                contact1www: __.sanitiseAsTrimString(cols[18]),
                                contact1name: __.sanitiseAsTrimString(cols[19]),
                                contact1salutation: __.sanitiseAsTrimString(cols[20]),
                                contact2address1: __.sanitiseAsTrimString(cols[21]),
                                contact2address2: __.sanitiseAsTrimString(cols[22]),
                                contact2address3: __.sanitiseAsTrimString(cols[23]),
                                contact2address4: __.sanitiseAsTrimString(cols[24]),
                                contact2city: __.sanitiseAsTrimString(cols[25]),
                                contact2state: __.sanitiseAsTrimString(cols[26]),
                                contact2postcode: __.sanitiseAsTrimString(cols[27]),
                                contact2country: __.sanitiseAsTrimString(cols[28]),
                                contact2phone1: __.sanitiseAsTrimString(cols[29]),
                                contact2phone2: __.sanitiseAsTrimString(cols[30]),
                                contact2phone3: __.sanitiseAsTrimString(cols[31]),
                                contact2fax: __.sanitiseAsTrimString(cols[32]),
                                contact2email: __.sanitiseAsTrimString(cols[33]),
                                contact2www: __.sanitiseAsTrimString(cols[34]),
                                contact2name: __.sanitiseAsTrimString(cols[35]),
                                contact2salutation: __.sanitiseAsTrimString(cols[36]),
                                contact3address1: __.sanitiseAsTrimString(cols[37]),
                                contact3address2: __.sanitiseAsTrimString(cols[38]),
                                contact3address3: __.sanitiseAsTrimString(cols[39]),
                                contact3address4: __.sanitiseAsTrimString(cols[40]),
                                contact3city: __.sanitiseAsTrimString(cols[41]),
                                contact3state: __.sanitiseAsTrimString(cols[42]),
                                contact3country: __.sanitiseAsTrimString(cols[43]),
                                contact3phone1: __.sanitiseAsTrimString(cols[44]),
                                contact3phone2: __.sanitiseAsTrimString(cols[45]),
                                contact3phone3: __.sanitiseAsTrimString(cols[46]),
                                contact3fax: __.sanitiseAsTrimString(cols[47]),
                                contact3email: __.sanitiseAsTrimString(cols[48]),
                                contact3www: __.sanitiseAsTrimString(cols[49]),
                                contact3name: __.sanitiseAsTrimString(cols[50]),
                                contact3salutation: __.sanitiseAsTrimString(cols[51]),
                                contact4address1: __.sanitiseAsTrimString(cols[52]),
                                contact4address2: __.sanitiseAsTrimString(cols[53]),
                                contact4address3: __.sanitiseAsTrimString(cols[54]),
                                contact4address4: __.sanitiseAsTrimString(cols[55]),
                                contact4city: __.sanitiseAsTrimString(cols[56]),
                                contact4state: __.sanitiseAsTrimString(cols[57]),
                                contact4country: __.sanitiseAsTrimString(cols[58]),
                                contact4phone1: __.sanitiseAsTrimString(cols[59]),
                                contact4phone2: __.sanitiseAsTrimString(cols[60]),
                                contact4phone3: __.sanitiseAsTrimString(cols[61]),
                                contact4fax: __.sanitiseAsTrimString(cols[62]),
                                contact4email: __.sanitiseAsTrimString(cols[63]),
                                contact4www: __.sanitiseAsTrimString(cols[64]),
                                contact4name: __.sanitiseAsTrimString(cols[65]),
                                contact4salutation: __.sanitiseAsTrimString(cols[66]),
                                contact5address1: __.sanitiseAsTrimString(cols[67]),
                                contact5address2: __.sanitiseAsTrimString(cols[68]),
                                contact5address3: __.sanitiseAsTrimString(cols[69]),
                                contact5address4: __.sanitiseAsTrimString(cols[70]),
                                contact5city: __.sanitiseAsTrimString(cols[71]),
                                contact5state: __.sanitiseAsTrimString(cols[72]),
                                contact5country: __.sanitiseAsTrimString(cols[73]),
                                contact5phone1: __.sanitiseAsTrimString(cols[74]),
                                contact5phone2: __.sanitiseAsTrimString(cols[75]),
                                contact5phone3: __.sanitiseAsTrimString(cols[76]),
                                contact5fax: __.sanitiseAsTrimString(cols[77]),
                                contact5email: __.sanitiseAsTrimString(cols[78]),
                                contact5www: __.sanitiseAsTrimString(cols[79]),
                                contact5name: __.sanitiseAsTrimString(cols[80]),
                                contact5salutation: __.sanitiseAsTrimString(cols[81]),
                                picture: __.sanitiseAsTrimString(cols[82]),
                                notes: __.sanitiseAsTrimString(cols[83]),
                                identifiers: __.sanitiseAsTrimString(cols[84]),
                                customlist1: __.sanitiseAsTrimString(cols[85]),
                                customlist2: __.sanitiseAsTrimString(cols[86]),
                                customlist3: __.sanitiseAsTrimString(cols[87]),
                                customfield1: __.sanitiseAsTrimString(cols[88]),
                                customfield2: __.sanitiseAsTrimString(cols[89]),
                                customfield3: __.sanitiseAsTrimString(cols[90]),
                                billingrate: __.sanitiseAsTrimString(cols[91]),
                                terms: __.sanitiseAsTrimString(cols[92]),
                                discountdays: __.sanitiseAsTrimString(cols[93]),
                                balanceduedays: __.sanitiseAsTrimString(cols[94]),
                                percentdiscount: __.sanitiseAsTrimString(cols[95]),
                                percentmonthlycharge: __.sanitiseAsTrimString(cols[96]),
                                taxcode: __.sanitiseAsTrimString(cols[97]),
                                creditlimit: __.sanitiseAsTrimString(cols[98]),
                                taxidno: __.sanitiseAsTrimString(cols[99]),
                                percentvolumediscount: __.sanitiseAsTrimString(cols[100]),
                                salespurchaselayout: __.sanitiseAsTrimString(cols[101]),
                                pricelevel: __.sanitiseAsTrimString(cols[102]),
                                paymentmethod: __.sanitiseAsTrimString(cols[103]),
                                paymentnotes: __.sanitiseAsTrimString(cols[104]),
                                nameoncard: __.sanitiseAsTrimString(cols[105]),
                                cardno: __.sanitiseAsTrimString(cols[106]),
                                expirydate: __.sanitiseAsTrimString(cols[107]),
                                bsb: __.sanitiseAsTrimString(cols[108]),
                                acctno: __.sanitiseAsTrimString(cols[109]),
                                acctname: __.sanitiseAsTrimString(cols[110]),
                                abn: __.sanitiseAsTrimString(cols[111]),
                                abnbranch: __.sanitiseAsTrimString(cols[112]),
                                account: __.sanitiseAsTrimString(cols[113]),
                                salesperson: __.sanitiseAsTrimString(cols[114]),
                                salespersoncardid: __.sanitiseAsTrimString(cols[115]),
                                comment: __.sanitiseAsTrimString(cols[116]),
                                shippingmethod: __.sanitiseAsTrimString(cols[117]),
                                printedform: __.sanitiseAsTrimString(cols[118]),
                                freighttaxcode: __.sanitiseAsTrimString(cols[119]),
                                usecustomerstaxcode: __.sanitiseAsTrimString(cols[120]),
                                receiptmemo: __.sanitiseAsTrimString(cols[121]),
                                invoicepurchaseorderdelivery: __.sanitiseAsTrimString(cols[122]),
                                recordid: __.sanitiseAsTrimString(cols[123]),
                                isclient: 1,
                                issupplier: 0
                              };

                              if (__.isBlank(entry.company) || __.isBlank(entry.cardid))
                              {
                                world.numskipped++;
                                return;
                              }

                              if (entry.cardid == '*None')
                                entry.cardid = entry.company;

                              calls.push
                              (
                                function(callback)
                                {
                                  console.log('Processing: ' + entry.company);
                                  doImportInsertOrUpdateClient(tx, world, entry).then
                                  (
                                    function(clientid)
                                    {
                                      entry.clientid = clientid;
                                      callback(null, null);
                                    }
                                  ).then
                                  (
                                    null,
                                    function(err)
                                    {
                                      callback(null, err.message);
                                    }
                                  );
                                }
                              );
                            }
                          );

                          // Now process rows...
                          global.async.series
                          (
                            calls,
                            function(err, results)
                            {
                              if (!err)
                              {
                                var errors = [];

                                results.forEach
                                (
                                  function(row)
                                  {
                                    if (!__.isNull(row))
                                      errors.push(row);
                                  }
                                );

                                tx.commit
                                (
                                  function(err, ret)
                                  {
                                    if (!err)
                                    {
                                      done();
                                      global.log.info({importmyobclients: true}, 'End import for: ' + args.filename);
                                      global.pr.sendToRoom(global.config.env.notificationschannel, 'clientsimported', {filename: args.originalfilename, numinserted: world.numinserted, numupdated: world.numupdated, numskipped: world.numskipped});
                                    }
                                    else
                                    {
                                      tx.rollback
                                      (
                                        function(ignore)
                                        {
                                          done();
                                          global.log.error({importmyobclients: true}, msg + global.text_committx + ' ' + err.message);
                                        }
                                      );
                                    }
                                  }
                                );
                              }
                              else
                              {
                                tx.rollback
                                (
                                  function(ignore)
                                  {
                                    done();
                                    global.log.error({importmyobclients: true}, global.text_dbexception + ' ' + err.message);
                                  }
                                );
                              }
                            }
                          );
                        }
                        else
                        {
                          tx.rollback
                          (
                            function(ignore)
                            {
                              done();
                              global.log.error({importmyobclients: true}, global.text_unablegetidfromuuid + ' ' + err.message);
                            }
                          );
                        }
                      }
                    );
                  }
                  else
                  {
                    tx.rollback
                    (
                      function(ignore)
                      {
                        done();
                        global.log.error({importmyobclients: true}, global.text_unablegetidfromuuid + ' ' + err.message);
                      }
                    );
                  }
                }
              );
            }
            else
            {
              done();
              msg += global.text_notxstart + ' ' + err.message;
              global.log.error({importmyobclients: true}, msg);
            }
          }
        );
      }
      else
      {
        done();
        global.log.error({importmyobclients: true}, global.text_nodbconnection);
      }
    }
  );
}

function ImportMyobSuppliers(args)
{
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
              // We need user id and customer id to insert new entry...
              // Find user in cache...
              global.users.get
              (
                global.config.redis.prefix + args.uuid,
                function(err, uuidobj)
                {
                  if (!err)
                  {
                    global.safejsonparse
                    (
                      uuidobj,
                      function(err, uo)
                      {
                        if (!err)
                        {
                          var xlobj = global.xlreader.parse(args.filename);
                          var rows = xlobj[0].data;
                          var calls = [];
                          var world =
                          {
                            numinserted: 0,
                            numupdated: 0,
                            numskipped: 0,
                            cn:
                            {
                              custid: uo.custid,
                              userid: uo.userid
                            }
                          };

                          rows.forEach
                          (
                            function(cols, index)
                            {
                              // Skip header...
                              if (index == 0)
                                return;

                              var entry =
                              {
                                company: __.sanitiseAsTrimString(cols[0]),
                                firstname: __.sanitiseAsTrimString(cols[1]),
                                cardid: __.sanitiseAsTrimString(cols[2]),
                                cardstatus: __.sanitiseAsTrimString(cols[3]),
                                currencycode: __.sanitiseAsTrimString(cols[4]),
                                contact1address1: __.sanitiseAsTrimString(cols[5]),
                                contact1address2: __.sanitiseAsTrimString(cols[6]),
                                contact1address3: __.sanitiseAsTrimString(cols[7]),
                                contact1address4: __.sanitiseAsTrimString(cols[8]),
                                contact1city: __.sanitiseAsTrimString(cols[9]),
                                contact1state: __.sanitiseAsTrimString(cols[10]),
                                contact1postcode: __.sanitiseAsTrimString(cols[11]),
                                contact1country: __.sanitiseAsTrimString(cols[12]),
                                contact1phone1: __.sanitiseAsTrimString(cols[13]),
                                contact1phone2: __.sanitiseAsTrimString(cols[14]),
                                contact1phone3: __.sanitiseAsTrimString(cols[15]),
                                contact1fax: __.sanitiseAsTrimString(cols[16]),
                                contact1email: __.sanitiseAsTrimString(cols[17]),
                                contact1www: __.sanitiseAsTrimString(cols[18]),
                                contact1name: __.sanitiseAsTrimString(cols[19]),
                                contact1salutation: __.sanitiseAsTrimString(cols[20]),
                                contact2address1: __.sanitiseAsTrimString(cols[21]),
                                contact2address2: __.sanitiseAsTrimString(cols[22]),
                                contact2address3: __.sanitiseAsTrimString(cols[23]),
                                contact2address4: __.sanitiseAsTrimString(cols[24]),
                                contact2city: __.sanitiseAsTrimString(cols[25]),
                                contact2state: __.sanitiseAsTrimString(cols[26]),
                                contact2postcode: __.sanitiseAsTrimString(cols[27]),
                                contact2country: __.sanitiseAsTrimString(cols[28]),
                                contact2phone1: __.sanitiseAsTrimString(cols[29]),
                                contact2phone2: __.sanitiseAsTrimString(cols[30]),
                                contact2phone3: __.sanitiseAsTrimString(cols[31]),
                                contact2fax: __.sanitiseAsTrimString(cols[32]),
                                contact2email: __.sanitiseAsTrimString(cols[33]),
                                contact2www: __.sanitiseAsTrimString(cols[34]),
                                contact2name: __.sanitiseAsTrimString(cols[35]),
                                contact2salutation: __.sanitiseAsTrimString(cols[36]),
                                contact3address1: __.sanitiseAsTrimString(cols[37]),
                                contact3address2: __.sanitiseAsTrimString(cols[38]),
                                contact3address3: __.sanitiseAsTrimString(cols[39]),
                                contact3address4: __.sanitiseAsTrimString(cols[40]),
                                contact3city: __.sanitiseAsTrimString(cols[41]),
                                contact3state: __.sanitiseAsTrimString(cols[42]),
                                contact3country: __.sanitiseAsTrimString(cols[43]),
                                contact3phone1: __.sanitiseAsTrimString(cols[44]),
                                contact3phone2: __.sanitiseAsTrimString(cols[45]),
                                contact3phone3: __.sanitiseAsTrimString(cols[46]),
                                contact3fax: __.sanitiseAsTrimString(cols[47]),
                                contact3email: __.sanitiseAsTrimString(cols[48]),
                                contact3www: __.sanitiseAsTrimString(cols[49]),
                                contact3name: __.sanitiseAsTrimString(cols[50]),
                                contact3salutation: __.sanitiseAsTrimString(cols[51]),
                                contact4address1: __.sanitiseAsTrimString(cols[52]),
                                contact4address2: __.sanitiseAsTrimString(cols[53]),
                                contact4address3: __.sanitiseAsTrimString(cols[54]),
                                contact4address4: __.sanitiseAsTrimString(cols[55]),
                                contact4city: __.sanitiseAsTrimString(cols[56]),
                                contact4state: __.sanitiseAsTrimString(cols[57]),
                                contact4country: __.sanitiseAsTrimString(cols[58]),
                                contact4phone1: __.sanitiseAsTrimString(cols[59]),
                                contact4phone2: __.sanitiseAsTrimString(cols[60]),
                                contact4phone3: __.sanitiseAsTrimString(cols[61]),
                                contact4fax: __.sanitiseAsTrimString(cols[62]),
                                contact4email: __.sanitiseAsTrimString(cols[63]),
                                contact4www: __.sanitiseAsTrimString(cols[64]),
                                contact4name: __.sanitiseAsTrimString(cols[65]),
                                contact4salutation: __.sanitiseAsTrimString(cols[66]),
                                contact5address1: __.sanitiseAsTrimString(cols[67]),
                                contact5address2: __.sanitiseAsTrimString(cols[68]),
                                contact5address3: __.sanitiseAsTrimString(cols[69]),
                                contact5address4: __.sanitiseAsTrimString(cols[70]),
                                contact5city: __.sanitiseAsTrimString(cols[71]),
                                contact5state: __.sanitiseAsTrimString(cols[72]),
                                contact5country: __.sanitiseAsTrimString(cols[73]),
                                contact5phone1: __.sanitiseAsTrimString(cols[74]),
                                contact5phone2: __.sanitiseAsTrimString(cols[75]),
                                contact5phone3: __.sanitiseAsTrimString(cols[76]),
                                contact5fax: __.sanitiseAsTrimString(cols[77]),
                                contact5email: __.sanitiseAsTrimString(cols[78]),
                                contact5www: __.sanitiseAsTrimString(cols[79]),
                                contact5name: __.sanitiseAsTrimString(cols[80]),
                                contact5salutation: __.sanitiseAsTrimString(cols[81]),
                                picture: __.sanitiseAsTrimString(cols[82]),
                                notes: __.sanitiseAsTrimString(cols[83]),
                                identifiers: __.sanitiseAsTrimString(cols[84]),
                                customlist1: __.sanitiseAsTrimString(cols[85]),
                                customlist2: __.sanitiseAsTrimString(cols[86]),
                                customlist3: __.sanitiseAsTrimString(cols[87]),
                                customfield1: __.sanitiseAsTrimString(cols[88]),
                                customfield2: __.sanitiseAsTrimString(cols[89]),
                                customfield3: __.sanitiseAsTrimString(cols[90]),
                                billingrate: __.sanitiseAsTrimString(cols[91]),
                                costperhour: __.sanitiseAsTrimString(cols[92]),
                                terms: __.sanitiseAsTrimString(cols[93]),
                                discountdays: __.sanitiseAsTrimString(cols[94]),
                                balanceduedays: __.sanitiseAsTrimString(cols[95]),
                                percentdiscount: __.sanitiseAsTrimString(cols[96]),
                                taxcode: __.sanitiseAsTrimString(cols[97]),
                                creditlimit: __.sanitiseAsTrimString(cols[98]),
                                taxidno: __.sanitiseAsTrimString(cols[99]),
                                paymentmethod: __.sanitiseAsTrimString(cols[100]),
                                paymentnotes: __.sanitiseAsTrimString(cols[101]),
                                nameoncard: __.sanitiseAsTrimString(cols[102]),
                                cardno: __.sanitiseAsTrimString(cols[103]),
                                expirydate: __.sanitiseAsTrimString(cols[104]),
                                bsb: __.sanitiseAsTrimString(cols[105]),
                                acctno: __.sanitiseAsTrimString(cols[106]),
                                acctname: __.sanitiseAsTrimString(cols[107]),
                                abn: __.sanitiseAsTrimString(cols[108]),
                                abnbranch: __.sanitiseAsTrimString(cols[109]),
                                percentvolumediscount: __.sanitiseAsTrimString(cols[110]),
                                salespurchaselayout: __.sanitiseAsTrimString(cols[111]),
                                account: __.sanitiseAsTrimString(cols[112]),
                                comment: __.sanitiseAsTrimString(cols[113]),
                                shippingmethod: __.sanitiseAsTrimString(cols[114]),
                                printedform: __.sanitiseAsTrimString(cols[115]),
                                freighttaxcode: __.sanitiseAsTrimString(cols[116]),
                                usesupplierstaxcode: __.sanitiseAsTrimString(cols[117]),
                                paymentmemo: __.sanitiseAsTrimString(cols[118]),
                                invoicepurchaseorderdelivery: __.sanitiseAsTrimString(cols[119]),
                                recordid: __.sanitiseAsTrimString(cols[120]),
                                isclient: 0,
                                issupplier: 1
                              };

                              if (__.isBlank(entry.company) || __.isBlank(entry.cardid))
                              {
                                world.numskipped++;
                                return;
                              }

                              if (entry.cardid == '*None')
                                entry.cardid = entry.company;

                              calls.push
                              (
                                function(callback)
                                {
                                  console.log('Processing: ' + entry.company);
                                  doImportInsertOrUpdateClient(tx, world, entry).then
                                  (
                                    function(clientid)
                                    {
                                      entry.clientid = clientid;
                                      callback(null, null);
                                    }
                                  ).then
                                  (
                                    null,
                                    function(err)
                                    {
                                      callback(null, err.message);
                                    }
                                  );
                                }
                              );
                            }
                          );

                          // Now process rows...
                          global.async.series
                          (
                            calls,
                            function(err, results)
                            {
                              if (!err)
                              {
                                var errors = [];

                                results.forEach
                                (
                                  function(row)
                                  {
                                    if (!__.isNull(row))
                                      errors.push(row);
                                  }
                                );

                                tx.commit
                                (
                                  function(err, ret)
                                  {
                                    if (!err)
                                    {
                                      done();
                                      global.log.info({importmyobsuppliers: true}, 'End import for: ' + args.filename);
                                      global.pr.sendToRoom(global.config.env.notificationschannel, 'suppliersimported', {filename: args.originalfilename, numinserted: world.numinserted, numupdated: world.numupdated, numskipped: world.numskipped});
                                    }
                                    else
                                    {
                                      tx.rollback
                                      (
                                        function(ignore)
                                        {
                                          done();
                                          global.log.error({importmyobsuppliers: true}, msg + global.text_committx + ' ' + err.message);
                                        }
                                      );
                                    }
                                  }
                                );
                              }
                              else
                              {
                                tx.rollback
                                (
                                  function(ignore)
                                  {
                                    done();
                                    global.log.error({importmyobsuppliers: true}, global.text_dbexception + ' ' + err.message);
                                  }
                                );
                              }
                            }
                          );
                        }
                        else
                        {
                          tx.rollback
                          (
                            function(ignore)
                            {
                              done();
                              global.log.error({importmyobsuppliers: true}, global.text_unablegetidfromuuid + ' ' + err.message);
                            }
                          );
                        }
                      }
                    );
                  }
                  else
                  {
                    tx.rollback
                    (
                      function(ignore)
                      {
                        done();
                        global.log.error({importmyobsuppliers: true}, global.text_unablegetidfromuuid + ' ' + err.message);
                      }
                    );
                  }
                }
              );
            }
            else
            {
              done();
              msg += global.text_notxstart + ' ' + err.message;
              global.log.error({importmyobsuppliers: true}, msg);
            }
          }
        );
      }
      else
      {
        done();
        global.log.error({importmyobsuppliers: true}, global.text_nodbconnection);
      }
    }
  );
}

function ImportMyobAccounts(args)
{
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
              // We need user id and customer id to insert new entry...
              // Find user in cache...
              global.users.get
              (
                global.config.redis.prefix + args.uuid,
                function(err, uuidobj)
                {
                  if (!err)
                  {
                    global.safejsonparse
                    (
                      uuidobj,
                      function(err, uo)
                      {
                        if (!err)
                        {
                          var xlobj = global.xlreader.parse(args.filename);
                          var rows = xlobj[0].data;
                          var calls = [];
                          var world =
                          {
                            numinserted: 0,
                            numupdated: 0,
                            numskipped: 0,
                            cn:
                            {
                              custid: uo.custid,
                              userid: uo.userid
                            }
                          };

                          rows.forEach
                          (
                            function(cols, index)
                            {
                              // Skip header...
                              if (index == 0)
                                return;

                              var entry =
                              {
                                code: __.sanitiseAsTrimString(cols[0]),
                                name: __.sanitiseAsTrimString(cols[1]),
                                header: __.sanitiseAsTrimString(cols[2]),
                                balance: __.sanitiseAsTrimString(cols[3]),
                                type: __.sanitiseAsTrimString(cols[4]),
                                lastchequeno: __.sanitiseAsTrimString(cols[5]),
                                taxcode: __.sanitiseAsTrimString(cols[6]),
                                currencycode: __.sanitiseAsTrimString(cols[7]),
                                exchangeaccount: __.sanitiseAsTrimString(cols[8]),
                                inactiveaccount: __.sanitiseAsTrimString(cols[9]),
                                accountlinkcode: __.sanitiseAsTrimString(cols[10]),
                                bsb: __.sanitiseAsTrimString(cols[11]),
                                bankacctno: __.sanitiseAsTrimString(cols[12]),
                                bankacctname: __.sanitiseAsTrimString(cols[13]),
                                companytradingname: __.sanitiseAsTrimString(cols[14]),
                                createbankfiles: __.sanitiseAsTrimString(cols[15]),
                                bankcode: __.sanitiseAsTrimString(cols[16]),
                                directentryuserid: __.sanitiseAsTrimString(cols[17]),
                                selfbalancingtx: __.sanitiseAsTrimString(cols[18]),
                                description: __.sanitiseAsTrimString(cols[19]),
                                classificationforstmntcashflow: __.sanitiseAsTrimString(cols[20]),
                                subtotalheaderaccts: __.sanitiseAsTrimString(cols[21])
                              };

                              if (__.isNull(entry.code) || __.isNull(entry.name) || __.isNull(entry.type))
                              {
                                world.numskipped++;
                                return;
                              }

                              if (entry.inactiveaccount == 'Y')
                              {
                                world.numskipped++;
                                return;
                              }

                              entry.type = entry.type.toUpperCase();
                              if ((entry.type == 'ASSET') || (entry.type == 'OTHER ASSET') || (entry.type == 'FIXED ASSET'))
                                entry.type = 1;
                              else if ((entry.type == 'EXPENSE') || (entry.type == 'OTHER EXPENSE') || (entry.type == 'ACCOUNTS RECEIVABLE'))
                                entry.type = 2;
                              else if ((entry.type == 'LIABILITY') || (entry.type == 'LONG TERM LIABILITY') || (entry.type == 'OTHER LIABILITY') || (entry.type == 'OTHER CURRENT LIABILITY'))
                                entry.type = 3;
                              else if (entry.type == 'EQUITY')
                                entry.type = 4;
                              else if ((entry.type == 'INCOME') || (entry.type == 'OTHER INCOME') || (entry.type == 'ACCOUNTS PAYABLE'))
                                entry.type = 5;
                              else if (entry.type == 'COST OF SALES')
                                entry.type = 6;
                              else
                                entry.type = 99;

                              calls.push
                              (
                                function(callback)
                                {
                                  global.modaccounts.doFindTaxCode(tx, world.cn.custid, entry.taxcode).then
                                  (
                                    function(taxcodeid)
                                    {
                                      entry.taxcodeid = taxcodeid;
                                      return doImportInsertOrUpdateAccount(tx, world, entry);
                                    }
                                  ).then
                                  (
                                    function(accountid)
                                    {
                                      entry.accountid = accountid;
                                      callback(null, null);
                                    }
                                  ).then
                                  (
                                    null,
                                    function(err)
                                    {
                                      callback(null, err.message);
                                    }
                                  );
                                }
                              );
                            }
                          );

                          // Now process rows...
                          global.async.series
                          (
                            calls,
                            function(err, results)
                            {
                              if (!err)
                              {
                                var errors = [];

                                results.forEach
                                (
                                  function (row)
                                  {
                                    if (!__.isNull(row))
                                      errors.push(row);
                                  }
                                );

                                tx.commit
                                (
                                  function(err, ret)
                                  {
                                    if (!err)
                                    {
                                      done();
                                      global.log.info({importmyobaccounts: true}, 'End import for: ' + world.filename);
                                      global.pr.sendToRoom(global.config.env.notificationschannel, 'accountsimported', {filename: args.originalfilename, numinserted: world.numinserted, numupdated: world.numupdated, numskipped: world.numskipped});
                                    }
                                    else
                                    {
                                      tx.rollback
                                      (
                                        function(ignore)
                                        {
                                          done();
                                          global.log.error({importmyobaccounts: true}, msg + global.text_committx + ' ' + err.message);
                                        }
                                      );
                                    }
                                  }
                                );
                              }
                              else
                              {
                                tx.rollback
                                (
                                  function(ignore)
                                  {
                                    done();
                                    global.log.error({importmyobaccounts: true}, global.text_dbexception + ' ' + err.message);
                                  }
                                );
                              }
                            }
                          );
                        }
                        else
                        {
                          tx.rollback
                          (
                            function(ignore)
                            {
                              done();
                              global.log.error({importmyobaccounts: true}, global.text_unablegetidfromuuid + ' ' + err.message);
                            }
                          );
                        }
                      }
                    );
                  }
                  else
                  {
                    tx.rollback
                    (
                      function(ignore)
                      {
                        done();
                        global.log.error({importmyobaccounts: true}, global.text_unablegetidfromuuid + ' ' + err.message);
                      }
                    );
                  }
                }
              );
            }
            else
            {
              done();
              msg += global.text_notxstart + ' ' + err.message;
              global.log.error({importmyobaccounts: true}, msg);
            }
          }
        );
      }
      else
      {
        done();
        global.log.error({importmyobaccounts: true}, global.text_nodbconnection);
      }
    }
  );
}

function ImportMyobEmployees(args)
{
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
              // We need user id and customer id to insert new entry...
              // Find user in cache...
              global.users.get
              (
                global.config.redis.prefix + args.uuid,
                function(err, uuidobj)
                {
                  if (!err)
                  {
                    global.safejsonparse
                    (
                      uuidobj,
                      function(err, uo)
                      {
                        if (!err)
                        {
                          // TODO: https://github.com/mgcrea/node-xlsx/issues/56
                          // Otherwise date columns returns raw date data from excel which we can't parse....
                          // See node-xlsx/lib/index.js
                          // Change ine 27 from:
                          //   return { name: name, data: _xlsx2.default.utils.sheet_to_json(sheet, { header: 1, raw: true }) };
                          // to:
                          //   return { name: name, data: _xlsx2.default.utils.sheet_to_json(sheet, { header: 1, raw: false }) };

                          var xlobj = global.xlreader.parse(args.filename);
                          var rows = xlobj[0].data;
                          var calls = [];
                          var world =
                          {
                            numinserted: 0,
                            numupdated: 0,
                            numskipped: 0,
                            cn:
                            {
                              custid: uo.custid,
                              userid: uo.userid
                            }
                          };

                          rows.forEach
                          (
                            function(cols, index)
                            {
                              // Skip header...
                              if (index == 0)
                                return;

                              var entry =
                              {
                                lastname: __.sanitiseAsTrimString(cols[0]),
                                firstname: __.sanitiseAsTrimString(cols[1]),
                                cardid: __.sanitiseAsTrimString(cols[2]),
                                cardstatus: __.sanitiseAsTrimString(cols[3]),
                                currencycode: __.sanitiseAsTrimString(cols[4]),
                                addr1: __.sanitiseAsTrimString(cols[5]),
                                addr2: __.sanitiseAsTrimString(cols[6]),
                                addr3: __.sanitiseAsTrimString(cols[7]),
                                addr4: __.sanitiseAsTrimString(cols[8]),
                                city: __.sanitiseAsTrimString(cols[9]),
                                state: __.sanitiseAsTrimString(cols[10]),
                                postcode: __.sanitiseAsTrimString(cols[11]),
                                country: __.sanitiseAsTrimString(cols[12]),
                                phone1: __.sanitiseAsTrimString(cols[13]),
                                phone2: __.sanitiseAsTrimString(cols[14]),
                                phone3: __.sanitiseAsTrimString(cols[15]),
                                fax: __.sanitiseAsTrimString(cols[16]),
                                email: __.sanitiseAsTrimString(cols[17]),
                                www: __.sanitiseAsTrimString(cols[18]),
                                salutation: __.sanitiseAsTrimString(cols[19]),
                                addr2_1: __.sanitiseAsTrimString(cols[20]),
                                addr2_2: __.sanitiseAsTrimString(cols[21]),
                                addr2_3: __.sanitiseAsTrimString(cols[22]),
                                addr2_4: __.sanitiseAsTrimString(cols[23]),
                                city2: __.sanitiseAsTrimString(cols[24]),
                                state2: __.sanitiseAsTrimString(cols[25]),
                                postcode2: __.sanitiseAsTrimString(cols[26]),
                                country2: __.sanitiseAsTrimString(cols[27]),
                                phone2_1: __.sanitiseAsTrimString(cols[28]),
                                phone2_2: __.sanitiseAsTrimString(cols[29]),
                                phone2_3: __.sanitiseAsTrimString(cols[30]),
                                fax2: __.sanitiseAsTrimString(cols[31]),
                                email2: __.sanitiseAsTrimString(cols[32]),
                                www2: __.sanitiseAsTrimString(cols[33]),
                                salutation2: __.sanitiseAsTrimString(cols[34]),
                                addr3_1: __.sanitiseAsTrimString(cols[35]),
                                addr3_2: __.sanitiseAsTrimString(cols[36]),
                                addr3_3: __.sanitiseAsTrimString(cols[37]),
                                addr3_4: __.sanitiseAsTrimString(cols[38]),
                                city3: __.sanitiseAsTrimString(cols[39]),
                                state3: __.sanitiseAsTrimString(cols[40]),
                                postcode3: __.sanitiseAsTrimString(cols[41]),
                                country3: __.sanitiseAsTrimString(cols[42]),
                                phone3_1: __.sanitiseAsTrimString(cols[43]),
                                phone3_2: __.sanitiseAsTrimString(cols[44]),
                                phone3_3: __.sanitiseAsTrimString(cols[45]),
                                fax3: __.sanitiseAsTrimString(cols[46]),
                                email3: __.sanitiseAsTrimString(cols[47]),
                                www3: __.sanitiseAsTrimString(cols[48]),
                                salutation3: __.sanitiseAsTrimString(cols[49]),
                                addr4_1: __.sanitiseAsTrimString(cols[50]),
                                addr4_2: __.sanitiseAsTrimString(cols[51]),
                                addr4_3: __.sanitiseAsTrimString(cols[52]),
                                addr4_4: __.sanitiseAsTrimString(cols[53]),
                                city4: __.sanitiseAsTrimString(cols[54]),
                                state4: __.sanitiseAsTrimString(cols[55]),
                                postcode4: __.sanitiseAsTrimString(cols[56]),
                                country4: __.sanitiseAsTrimString(cols[57]),
                                phone4_1: __.sanitiseAsTrimString(cols[58]),
                                phone4_2: __.sanitiseAsTrimString(cols[59]),
                                phone4_3: __.sanitiseAsTrimString(cols[60]),
                                fax4: __.sanitiseAsTrimString(cols[61]),
                                email4: __.sanitiseAsTrimString(cols[62]),
                                www4: __.sanitiseAsTrimString(cols[63]),
                                salutation4: __.sanitiseAsTrimString(cols[64]),
                                addr5_1: __.sanitiseAsTrimString(cols[65]),
                                addr5_2: __.sanitiseAsTrimString(cols[66]),
                                addr5_3: __.sanitiseAsTrimString(cols[67]),
                                addr5_4: __.sanitiseAsTrimString(cols[68]),
                                city5: __.sanitiseAsTrimString(cols[69]),
                                state5: __.sanitiseAsTrimString(cols[70]),
                                postcode5: __.sanitiseAsTrimString(cols[71]),
                                country5: __.sanitiseAsTrimString(cols[72]),
                                phone5_1: __.sanitiseAsTrimString(cols[73]),
                                phone5_2: __.sanitiseAsTrimString(cols[74]),
                                phone5_3: __.sanitiseAsTrimString(cols[75]),
                                fax5: __.sanitiseAsTrimString(cols[76]),
                                email5: __.sanitiseAsTrimString(cols[77]),
                                www5: __.sanitiseAsTrimString(cols[78]),
                                salutation5: __.sanitiseAsTrimString(cols[79]),
                                picture: __.sanitiseAsTrimString(cols[80]),
                                notes: __.sanitiseAsTrimString(cols[81]),
                                identifiers: __.sanitiseAsTrimString(cols[82]),
                                customlist1: __.sanitiseAsTrimString(cols[83]),
                                customlist2: __.sanitiseAsTrimString(cols[84]),
                                customlist3: __.sanitiseAsTrimString(cols[85]),
                                custom1: __.sanitiseAsTrimString(cols[86]),
                                custom2: __.sanitiseAsTrimString(cols[87]),
                                custom3: __.sanitiseAsTrimString(cols[88]),
                                billingrate: __.sanitiseAsPrice(cols[89]),
                                costperhour: __.sanitiseAsPrice(cols[90]),
                                numbankaccts: __.sanitiseAsTrimString(cols[91]),
                                bsb: __.sanitiseAsTrimString(cols[92]),
                                acctnumber: __.sanitiseAsTrimString(cols[93]),
                                acctname: __.sanitiseAsTrimString(cols[94]),
                                statementtext: __.sanitiseAsTrimString(cols[95]),
                                bankvalue: __.sanitiseAsTrimString(cols[96]),
                                bankvaluetype: __.sanitiseAsTrimString(cols[97]),
                                bsb2: __.sanitiseAsTrimString(cols[98]),
                                acctnumber2: __.sanitiseAsTrimString(cols[99]),
                                acctname2: __.sanitiseAsTrimString(cols[100]),
                                bankvalue2: __.sanitiseAsTrimString(cols[101]),
                                bankvaluetype2: __.sanitiseAsTrimString(cols[102]),
                                bsb3: __.sanitiseAsTrimString(cols[103]),
                                acctnumber3: __.sanitiseAsTrimString(cols[104]),
                                acctname3: __.sanitiseAsTrimString(cols[105]),
                                employmentbasis: __.sanitiseAsTrimString(cols[106]),
                                paymentmethod: __.sanitiseAsTrimString(cols[107]),
                                employmentclassification: __.sanitiseAsTrimString(cols[108]),
                                dob: __.sanitiseAsTrimString(cols[109]),
                                gender: __.sanitiseAsTrimString(cols[110]),
                                startdate: __.sanitiseAsTrimString(cols[111]),
                                terminationdate: __.sanitiseAsTrimString(cols[112]),
                                paybasis: __.sanitiseAsTrimString(cols[113]),
                                salaryrate: __.sanitiseAsPrice(cols[114]),
                                payfrequency: __.sanitiseAsTrimString(cols[115]),
                                housinpayperiod: __.sanitiseAsPrice(cols[116]),
                                wagesexpenseaccount: __.sanitiseAsTrimString(cols[117]),
                                superfund: __.sanitiseAsTrimString(cols[118]),
                                employeemembershipno: __.sanitiseAsTrimString(cols[119]),
                                tfn: __.sanitiseAsTrimString(cols[120]),
                                taxtable: __.sanitiseAsTrimString(cols[121]),
                                witholdingvariationrate: __.sanitiseAsTrimString(cols[122]),
                                totalrebates: __.sanitiseAsPrice(cols[123]),
                                extratax: __.sanitiseAsPrice(cols[124]),
                                defaultcategory: __.sanitiseAsTrimString(cols[125]),
                                recordid: __.sanitiseAsTrimString(cols[126]),
                                employmentcategory: __.sanitiseAsTrimString(cols[127]),
                                employmentstatus: __.sanitiseAsTrimString(cols[128]),
                                terminatedby: __.sanitiseAsTrimString(cols[129]),
                                methodoftermination: __.sanitiseAsTrimString(cols[130]),
                                payslipdelivery: __.sanitiseAsTrimString(cols[131]),
                                payslipemail: __.sanitiseAsTrimString(cols[132])
                              };

                              if (__.isNull(entry.lastname) && __.isNull(entry.firstname))
                              {
                                world.numskipped++;
                                return;
                              }

                              if (entry.cardstatus == 'Y')
                              {
                                world.numskipped++;
                                return;
                              }

                              if (entry.paybasis == 'H')
                                entry.paybasis = 1;
                              else
                                entry.paybasis = 6;

                              if (entry.payfrequency == 'W')
                                entry.payfrequency = global.itype_payfrequency_weekly;
                              else
                                entry.payfrequency = global.itype_payfrequency_fortnightly;

                              if (entry.employmentstatus == 'F')
                                entry.employmentstatus = global.employmenttype_fulltime;
                              else
                                entry.employmentstatus = global.employmenttype_parttime;

                              if (entry.taxtable == 'Tax Free Threshold')
                                entry.taxtable = global.itype_taxtable_taxfreethreshold;
                              else
                                entry.taxtable = global.itype_taxtable_notaxfreethreshold;

                              entry.dob = global.moment(entry.dob, 'MM/DD/YYYY').format('YYYY-MM-DD');
                              entry.startdate = global.moment(entry.startdate, 'MM/DD/YYYY').format('YYYY-MM-DD');
                              entry.terminationdate = global.moment(entry.terminationdate, 'MM/DD/YYYY').format('YYYY-MM-DD');

                              calls.push
                              (
                                function(callback)
                                {
                                  global.modaccounts.doFindAccountCode(tx, world.cn.custid, entry.wagesexpenseaccount).then
                                  (
                                    function(accountid)
                                    {
                                      entry.wageaccountid = accountid;
                                      return global.modaccounts.doFindSuperfund(tx, world.cn.custid, entry.superfund);
                                    }
                                  ).then
                                  (
                                    function(superfundid)
                                    {
                                      entry.superfundid = superfundid;
                                      return doImportInsertOrUpdateEmployee(tx, world, entry);
                                    }
                                  ).then
                                  (
                                    function(employeeid)
                                    {
                                      entry.employeeid = employeeid;
                                      callback(null, null);
                                    }
                                  ).then
                                  (
                                    null,
                                    function(err)
                                    {
                                      callback(null, err.message);
                                    }
                                  );
                                }
                              );
                            }
                          );

                          // Now process rows...
                          global.async.series
                          (
                            calls,
                            function(err, results)
                            {
                              if (!err)
                              {
                                var errors = [];

                                results.forEach
                                (
                                  function (row)
                                  {
                                    if (!__.isNull(row))
                                      errors.push(row);
                                  }
                                );

                                tx.commit
                                (
                                  function(err, ret)
                                  {
                                    if (!err)
                                    {
                                      done();
                                      global.log.info({importmyobemployees: true}, 'End import for: ' + world.filename);
                                      global.pr.sendToRoom(global.config.env.notificationschannel, 'employeesimported', {filename: args.originalfilename, numinserted: world.numinserted, numupdated: world.numupdated, numskipped: world.numskipped});
                                    }
                                    else
                                    {
                                      tx.rollback
                                      (
                                        function(ignore)
                                        {
                                          done();
                                          global.log.error({importmyobemployees: true}, msg + global.text_committx + ' ' + err.message);
                                        }
                                      );
                                    }
                                  }
                                );
                              }
                              else
                              {
                                tx.rollback
                                (
                                  function(ignore)
                                  {
                                    done();
                                    global.log.error({importmyobemployees: true}, global.text_dbexception + ' ' + err.message);
                                  }
                                );
                              }
                            }
                          );
                        }
                        else
                        {
                          tx.rollback
                          (
                            function(ignore)
                            {
                              done();
                              global.log.error({importmyobemployees: true}, global.text_unablegetidfromuuid + ' ' + err.message);
                            }
                          );
                        }
                      }
                    );
                  }
                  else
                  {
                    tx.rollback
                    (
                      function(ignore)
                      {
                        done();
                        global.log.error({importmyobemployees: true}, global.text_unablegetidfromuuid + ' ' + err.message);
                      }
                    );
                  }
                }
              );
            }
            else
            {
              done();
              msg += global.text_notxstart + ' ' + err.message;
              global.log.error({importmyobemployees: true}, msg);
            }
          }
        );
      }
      else
      {
        done();
        global.log.error({importmyobemployees: true}, global.text_nodbconnection);
      }
    }
  );
}

function ImportProducts1(args)
{
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
              // We need user id and customer id to insert new entry...
              // Find user in cache...
              global.users.get
              (
                global.config.redis.prefix + args.uuid,
                function(err, uuidobj)
                {
                  if (!err)
                  {
                    global.safejsonparse
                    (
                      uuidobj,
                      function(err, uo)
                      {
                        if (!err)
                        {
                          var xlobj = global.xlreader.parse(args.filename);
                          var rows = xlobj[0].data;
                          var calls = [];
                          var world =
                          {
                            productcategoryid: __.sanitiseAsBigInt(args.productcategoryid),
                            numinserted: 0,
                            numupdated: 0,
                            numskipped: 0,
                            cn:
                            {
                              custid: uo.custid,
                              userid: uo.userid
                            }
                          };

                          rows.forEach
                          (
                            function (cols, index)
                            {
                              // Skip header...
                              if (index == 0)
                                return;

                              var entry =
                              {
                                itemno: __.sanitiseAsTrimString(cols[0]),
                                itemname: __.sanitiseAsTrimString(cols[1]),
                                itemgroup: __.sanitiseAsTrimString(cols[2]),
                                prefsupplierpartno: __.sanitiseAsTrimString(cols[3]),
                                prefsuppliername: __.sanitiseAsTrimString(cols[4]),
                                sellinguom: __.sanitiseAsTrimString(cols[5]),
                                uomsize: 1,
                                qtyonhand: __.sanitiseAsTrimString(cols[6]),
                                supplierorders: __.sanitiseAsTrimString(cols[7]),
                                customerorders: __.sanitiseAsTrimString(cols[8]),
                                standardcost: __.sanitiseAsTrimString(cols[9]),
                                sellingprice: __.sanitiseAsTrimString(cols[10])
                              };

                              if (__.isNull(entry.itemno) || __.isNull(entry.itemname))
                              {
                                world.numskipped++;
                                return;
                              }

                              var u = entry.sellinguom.split('/');

                              if (u.length == 2)
                              {
                                entry.sellinguom = u[0];
                                entry.uomsize = u[1];
                              }

                              calls.push
                              (
                                function (callback)
                                {
                                  doImportInsertOrUpdateProductCategory(tx, world, entry).then
                                  (
                                    function(productcategoryid)
                                    {
                                      if (!__.isNull(productcategoryid))
                                        world.productcategoryid = productcategoryid;

                                      return doImportInsertOrUpdateProduct(tx, world, entry);
                                    }
                                  ).then
                                  (
                                    function(productid)
                                    {
                                      entry.productid = productid;
                                      return doImportInsertPrice(tx, world, entry);
                                    }
                                  ).then
                                  (
                                    function(ignore)
                                    {
                                      callback(null, null);
                                    }
                                  ).then
                                  (
                                    null,
                                    function(err)
                                    {
                                      callback(null, err.message);
                                    }
                                  );
                                }
                              );
                            }
                          );

                          // Now process rows...
                          global.async.series
                          (
                            calls,
                            function(err, results)
                            {
                              if (!err)
                              {
                                var errors = [];

                                results.forEach
                                (
                                  function (row)
                                  {
                                    if (!__.isNull(row))
                                      errors.push(row);
                                  }
                                );

                                tx.commit
                                (
                                  function(err, ret)
                                  {
                                    if (!err)
                                    {
                                      done();
                                      global.log.info({importproducts1: true}, 'End import for: ' + world.filename);
                                      global.pr.sendToRoom(global.config.env.notificationschannel, 'productsimported', {filename: args.originalfilename, numinserted: world.numinserted, numupdated: world.numupdated, numskipped: world.numskipped});
                                    }
                                    else
                                    {
                                      tx.rollback
                                      (
                                        function(ignore)
                                        {
                                          done();
                                          global.log.error({importproducts1: true}, msg + global.text_committx + ' ' + err.message);
                                        }
                                      );
                                    }
                                  }
                                );
                              }
                              else
                              {
                                tx.rollback
                                (
                                  function(ignore)
                                  {
                                    done();
                                    global.log.error({importproducts1: true}, global.text_dbexception + ' ' + err.message);
                                  }
                                );
                              }
                            }
                          );
                        }
                        else
                        {
                          tx.rollback
                          (
                            function(ignore)
                            {
                              done();
                              global.log.error({importproducts1: true}, global.text_unablegetidfromuuid + ' ' + err.message);
                            }
                          );
                        }
                      }
                    );
                  }
                  else
                  {
                    tx.rollback
                    (
                      function(ignore)
                      {
                        done();
                        global.log.error({importproducts1: true}, global.text_unablegetidfromuuid + ' ' + err.message);
                      }
                    );
                  }
                }
              );
            }
            else
            {
              done();
              msg += global.text_notxstart + ' ' + err.message;
              global.log.error({importproducts1: true}, msg);
            }
          }
        );
      }
      else
      {
        done();
        global.log.error({importproducts1: true}, global.text_nodbconnection);
      }
    }
  );
}

function ImportProducts2(args)
{
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
              // We need user id and customer id to insert new entry...
              // Find user in cache...
              global.users.get
              (
                global.config.redis.prefix + args.uuid,
                function(err, uuidobj)
                {
                  if (!err)
                  {
                    global.safejsonparse
                    (
                      uuidobj,
                      function(err, uo)
                      {
                        if (!err)
                        {
                          var xlobj = global.xlreader.parse(args.filename);
                          var rows = xlobj[0].data;
                          var calls = [];
                          var world =
                          {
                            productcategoryid: __.sanitiseAsBigInt(args.productcategoryid),
                            numinserted: 0,
                            numupdated: 0,
                            numskipped: 0,
                            cn:
                            {
                              custid: uo.custid,
                              userid: uo.userid
                            }
                          };

                          rows.forEach
                          (
                            function (cols, index)
                            {
                              // Skip header...
                              if (index == 0)
                                return;

                              var entry =
                              {
                                itemno: __.sanitiseAsTrimString(cols[0]),
                                itemname: __.sanitiseAsTrimString(cols[1]),
                                barcode: __.sanitiseAsTrimString(cols[2])
                              };

                              if (__.isNull(entry.itemno) || __.isNull(entry.itemname))
                              {
                                world.numskipped++;
                                return;
                              }

                              calls.push
                              (
                                function (callback)
                                {
                                  tx.query
                                  (
                                    'update products set barcode2=$1 where code=$2',
                                    [
                                      __.sanitiseAsString(entry.barcode, 50),
                                      __.sanitiseAsString(entry.itemno, 50)
                                    ],
                                    function(err, result)
                                    {
                                      if (!err)
                                        callback(null, null);
                                      else
                                        callback(null, err.message);
                                    }
                                  );
                                }
                              );
                            }
                          );

                          // Now process rows...
                          global.async.series
                          (
                            calls,
                            function(err, results)
                            {
                              if (!err)
                              {
                                var errors = [];

                                results.forEach
                                (
                                  function (row)
                                  {
                                    if (!__.isNull(row))
                                      errors.push(row);
                                  }
                                );

                                tx.commit
                                (
                                  function(err, ret)
                                  {
                                    if (!err)
                                    {
                                      done();
                                      global.log.info({importproducts1: true}, 'End import for: ' + world.filename);
                                      global.pr.sendToRoom(global.config.env.notificationschannel, 'productsimported', {filename: args.originalfilename, numinserted: world.numinserted, numupdated: world.numupdated, numskipped: world.numskipped});
                                    }
                                    else
                                    {
                                      tx.rollback
                                      (
                                        function(ignore)
                                        {
                                          done();
                                          global.log.error({importproducts2: true}, msg + global.text_committx + ' ' + err.message);
                                        }
                                      );
                                    }
                                  }
                                );
                              }
                              else
                              {
                                tx.rollback
                                (
                                  function(ignore)
                                  {
                                    done();
                                    global.log.error({importproducts2: true}, global.text_dbexception + ' ' + err.message);
                                  }
                                );
                              }
                            }
                          );
                        }
                        else
                        {
                          tx.rollback
                          (
                            function(ignore)
                            {
                              done();
                              global.log.error({importproducts2: true}, global.text_unablegetidfromuuid + ' ' + err.message);
                            }
                          );
                        }
                      }
                    );
                  }
                  else
                  {
                    tx.rollback
                    (
                      function(ignore)
                      {
                        done();
                        global.log.error({importproducts2: true}, global.text_unablegetidfromuuid + ' ' + err.message);
                      }
                    );
                  }
                }
              );
            }
            else
            {
              done();
              msg += global.text_notxstart + ' ' + err.message;
              global.log.error({importproducts2: true}, msg);
            }
          }
        );
      }
      else
      {
        done();
        global.log.error({importproducts2: true}, global.text_nodbconnection);
      }
    }
  );
}

function ImportInventory1(args)
{
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
              // We need user id and customer id to insert new entry...
              // Find user in cache...
              global.users.get
              (
                global.config.redis.prefix + args.uuid,
                function(err, uuidobj)
                {
                  if (!err)
                  {
                    global.safejsonparse
                    (
                      uuidobj,
                      function(err, uo)
                      {
                        if (!err)
                        {
                          var xlobj = global.xlreader.parse(args.filename);
                          var rows = xlobj[0].data;
                          var calls = [];
                          var world =
                          {
                            productcategoryid: __.sanitiseAsBigInt(args.productcategoryid),
                            numinserted: 0,
                            numupdated: 0,
                            numskipped: 0,
                            cn:
                            {
                              custid: uo.custid,
                              userid: uo.userid
                            }
                          };

                          rows.forEach
                          (
                            function (cols, index)
                            {
                              // Skip header...
                              if (index < 11)
                                return;

                              var entry =
                              {
                                blank1: __.sanitiseAsTrimString(cols[0]),
                                itemno: __.sanitiseAsTrimString(cols[1]),
                                itemname: __.sanitiseAsTrimString(cols[2]),
                                onhand: __.sanitiseAsTrimString(cols[3]),
                                count1: __.sanitiseAsTrimString(cols[4]),
                                count2: __.sanitiseAsTrimString(cols[5])
                              };

                              if (__.isNull(entry.itemno) || __.isNull(entry.itemname))
                              {
                                world.numskipped++;
                                return;
                              }

                              calls.push
                              (
                                function (callback)
                                {
                                  var components = entry.itemno.split('_');

                                  // Need to also translate MYOB codes to new ones...
                                  if (components.length == 5)
                                  {
                                    var clientcode = components[0];
                                    var clientname = components[1];
                                    var cuptype = components[2];
                                    var cupsize = components[3];
                                    var brand = components[4];

                                    // Find product category...
                                    tx.query
                                    (
                                      'select id,name from productcategories where customers_id=$1 and code=$2',
                                      [
                                        args.cn.custid,
                                        __.sanitiseAsString(clientcode)
                                      ],
                                      function(err, result)
                                      {
                                        if (!err)
                                        {
                                          if (result.rows.length > 0)
                                          {
                                            var categoryid = result.rows[0].id;
                                            var name = result.rows[0].name;
                                            var newcode = '';

                                            if (clientcode == 'TPCC')
                                              newcode = clientname + '_' + cuptype + cupsize + '_' + brand;
                                            else
                                              newcode = cuptype + cupsize + '_' + brand;

                                            console.log('category: [' + categoryid + ' - ' + name + '] ' + entry.itemno + ' ==> ' + newcode);
                                          }

                                          callback(null, null);
                                        }
                                        else
                                          callback(null, err.message);
                                      }
                                    );
                                  }
                                  else
                                  {

                                    callback(null, null);
                                  }
                                }
                              );
                            }
                          );

                          // Now process rows...
                          global.async.series
                          (
                            calls,
                            function(err, results)
                            {
                              if (!err)
                              {
                                tx.rollback
                                (
                                  function(ignore)
                                  {
                                    done();
                                  }
                                );

                                /*
                                tx.commit
                                (
                                  function(err, ret)
                                  {
                                    if (!err)
                                    {
                                      done();
                                      global.log.info({importinventory1: true}, 'End import for: ' + world.filename);
                                      global.pr.sendToRoom(global.config.env.notificationschannel, 'productsimported', {filename: args.originalfilename, numinserted: world.numinserted, numupdated: world.numupdated, numskipped: world.numskipped});
                                    }
                                    else
                                    {
                                      tx.rollback
                                      (
                                        function(ignore)
                                        {
                                          done();
                                          global.log.error({importinventory1: true}, msg + global.text_committx + ' ' + err.message);
                                        }
                                      );
                                    }
                                  }
                                );
                                */
                              }
                              else
                              {
                                tx.rollback
                                (
                                  function(ignore)
                                  {
                                    done();
                                    global.log.error({importinventory1: true}, global.text_dbexception + ' ' + err.message);
                                  }
                                );
                              }
                            }
                          );
                        }
                        else
                        {
                          tx.rollback
                          (
                            function(ignore)
                            {
                              done();
                              global.log.error({importinventory1: true}, global.text_unablegetidfromuuid + ' ' + err.message);
                            }
                          );
                        }
                      }
                    );
                  }
                  else
                  {
                    tx.rollback
                    (
                      function(ignore)
                      {
                        done();
                        global.log.error({importinventory1: true}, global.text_unablegetidfromuuid + ' ' + err.message);
                      }
                    );
                  }
                }
              );
            }
            else
            {
              done();
              msg += global.text_notxstart + ' ' + err.message;
              global.log.error({importinventory1: true}, msg);
            }
          }
        );
      }
      else
      {
        done();
        global.log.error({importinventory1: true}, global.text_nodbconnection);
      }
    }
  );
}

// *******************************************************************************************************************************************************************************************
// Public ImportMyobProducts
module.exports.ImportMyobProducts = ImportMyobProducts;
module.exports.ImportMyobClients = ImportMyobClients;
module.exports.ImportMyobSuppliers = ImportMyobSuppliers;
module.exports.ImportMyobAccounts = ImportMyobAccounts;
module.exports.ImportMyobEmployees = ImportMyobEmployees;

module.exports.ImportProducts1 = ImportProducts1;
module.exports.ImportProducts2 = ImportProducts2;


module.exports.ImportInventory1 = ImportInventory1;
