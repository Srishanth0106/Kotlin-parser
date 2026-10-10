fun testLoops() {
    var count = 0
    while (count < 5) {
        println(count)
        count = count + 1
    }

    for (i in 1..10) {
        println(i)
    }
}
